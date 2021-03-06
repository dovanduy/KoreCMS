﻿using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using Castle.Core.Logging;
using Kore.Logging;
using Kore.Plugins.Indexing.Lucene.Models;
using Kore.Web.Indexing;
using Lucene.Net.Analysis;
using Lucene.Net.Documents;
using Lucene.Net.Index;
using Lucene.Net.QueryParsers;
using Lucene.Net.Search;
using Lucene.Net.Store;
using Lucene.Net.Util;

namespace Kore.Plugins.Indexing.Lucene.Services
{
    public class LuceneSearchBuilder : ISearchBuilder
    {
        private const int MaxResults = Int16.MaxValue;

        private readonly Directory _directory;

        private readonly List<BooleanClause> _clauses;
        private readonly List<BooleanClause> _filters;
        private int _count;
        private int _skip;
        private string _sort;
        private int _comparer;
        private bool _sortDescending;
        private bool _asFilter;

        // pending clause attributes
        private Occur _occur;

        private bool _exactMatch;
        private float _boost;
        private Query _query;
        private readonly Analyzer _analyzer = LuceneIndexProvider.CreateAnalyzer();

        public ILogger Logger { get; set; }

        public LuceneSearchBuilder(Directory directory)
        {
            _directory = directory;
            Logger = LoggingUtilities.Resolve();

            _count = MaxResults;
            _skip = 0;
            _clauses = new List<BooleanClause>();
            _filters = new List<BooleanClause>();
            _sort = string.Empty;
            _comparer = 0;
            _sortDescending = true;

            InitPendingClause();
        }

        public ISearchBuilder Parse(string defaultField, string query, bool escape)
        {
            return Parse(new[] { defaultField }, query, escape);
        }

        public ISearchBuilder Parse(string[] defaultFields, string query, bool escape)
        {
            if (defaultFields.Length == 0)
            {
                throw new ArgumentException("Default fields can't be empty");
            }

            if (string.IsNullOrWhiteSpace(query))
            {
                throw new ArgumentException("Query can't be empty");
            }

            if (escape)
            {
                query = QueryParser.Escape(query);

                // Need to escape spaces, but for some reason, QueryParser.Escape doesn't do that
                // https://dismantledtech.wordpress.com/2011/05/15/handling-spaces-in-lucene-wild-card-searches/
                query = query.Replace(" ", "\\ ");
            }

            foreach (var defaultField in defaultFields)
            {
                CreatePendingClause();
                _query = new QueryParser(LuceneIndexProvider.LuceneVersion, defaultField, _analyzer).Parse(query);
            }

            return this;
        }

        public ISearchBuilder WithField(string field, int value)
        {
            CreatePendingClause();
            _query = NumericRangeQuery.NewIntRange(field, value, value, true, true);
            return this;
        }

        public ISearchBuilder WithinRange(string field, int? min, int? max, bool includeMin = true, bool includeMax = true)
        {
            CreatePendingClause();
            _query = NumericRangeQuery.NewIntRange(field, min, max, includeMin, includeMax);
            return this;
        }

        public ISearchBuilder WithField(string field, double value)
        {
            CreatePendingClause();
            _query = NumericRangeQuery.NewDoubleRange(field, value, value, true, true);
            return this;
        }

        public ISearchBuilder WithinRange(string field, double? min, double? max, bool includeMin = true, bool includeMax = true)
        {
            CreatePendingClause();
            _query = NumericRangeQuery.NewDoubleRange(field, min, max, includeMin, includeMax);
            return this;
        }

        public ISearchBuilder WithField(string field, bool value)
        {
            return WithField(field, value ? 1 : 0);
        }

        public ISearchBuilder WithField(string field, DateTime value)
        {
            CreatePendingClause();
            _query = new TermQuery(new Term(field, DateTools.DateToString(value, DateTools.Resolution.MILLISECOND)));
            return this;
        }

        public ISearchBuilder WithinRange(string field, DateTime? min, DateTime? max, bool includeMin = true, bool includeMax = true)
        {
            CreatePendingClause();
            _query = new TermRangeQuery(field, min.HasValue ? DateTools.DateToString(min.Value, DateTools.Resolution.MILLISECOND) : null, max.HasValue ? DateTools.DateToString(max.Value, DateTools.Resolution.MILLISECOND) : null, includeMin, includeMax);
            return this;
        }

        public ISearchBuilder WithinRange(string field, string min, string max, bool includeMin = true, bool includeMax = true)
        {
            CreatePendingClause();
            _query = new TermRangeQuery(field, min != null ? QueryParser.Escape(min.ToLower()) : null, max != null ? QueryParser.Escape(max.ToLower()) : null, includeMin, includeMax);
            return this;
        }

        public ISearchBuilder WithField(string field, string value)
        {
            CreatePendingClause();

            if (!string.IsNullOrWhiteSpace(value))
            {
                _query = new TermQuery(new Term(field, QueryParser.Escape(value.ToLower())));
            }

            return this;
        }

        public ISearchBuilder Mandatory()
        {
            _occur = Occur.MUST;
            return this;
        }

        public ISearchBuilder Forbidden()
        {
            _occur = Occur.MUST_NOT;
            return this;
        }

        public ISearchBuilder ExactMatch()
        {
            _exactMatch = true;
            return this;
        }

        public ISearchBuilder Weighted(float weight)
        {
            _boost = weight;
            return this;
        }

        private void InitPendingClause()
        {
            _occur = Occur.SHOULD;
            _exactMatch = false;
            _query = null;
            _boost = 0;
            _asFilter = false;
        }

        private void CreatePendingClause()
        {
            if (_query == null)
            {
                return;
            }

            // comparing floating-point numbers using an epsilon value
            const double epsilon = 0.001;
            if (Math.Abs(_boost - 0) > epsilon)
            {
                _query.Boost = _boost;
            }

            if (!_exactMatch)
            {
                var termQuery = _query as TermQuery;
                if (termQuery != null)
                {
                    var term = termQuery.Term;
                    // prefixed queries are case sensitive
                    _query = new PrefixQuery(term);
                }
            }
            if (_asFilter)
            {
                _filters.Add(new BooleanClause(_query, _occur));
            }
            else
            {
                _clauses.Add(new BooleanClause(_query, _occur));
            }

            InitPendingClause();
        }

        public ISearchBuilder SortBy(string name)
        {
            _sort = name;
            _comparer = 0;
            return this;
        }

        public ISearchBuilder SortByInteger(string name)
        {
            _sort = name;
            _comparer = SortField.INT;
            return this;
        }

        public ISearchBuilder SortByBoolean(string name)
        {
            return SortByInteger(name);
        }

        public ISearchBuilder SortByString(string name)
        {
            _sort = name;
            _comparer = SortField.STRING;
            return this;
        }

        public ISearchBuilder SortByDouble(string name)
        {
            _sort = name;
            _comparer = SortField.DOUBLE;
            return this;
        }

        public ISearchBuilder SortByDateTime(string name)
        {
            _sort = name;
            _comparer = SortField.LONG;
            return this;
        }

        public ISearchBuilder Ascending()
        {
            _sortDescending = false;
            return this;
        }

        public ISearchBuilder AsFilter()
        {
            _asFilter = true;
            return this;
        }

        public ISearchBuilder Slice(int skip, int count)
        {
            if (skip < 0)
            {
                throw new ArgumentException("Skip must be greater or equal to zero");
            }

            if (count <= 0)
            {
                throw new ArgumentException("Count must be greater than zero");
            }

            _skip = skip;
            _count = count;

            return this;
        }

        private Query CreateQuery()
        {
            CreatePendingClause();

            var booleanQuery = new BooleanQuery();
            Query resultQuery = booleanQuery;

            if (_clauses.Count == 0)
            {
                if (_filters.Count > 0)
                {
                    // only filters applieds => transform to a boolean query
                    foreach (var clause in _filters)
                    {
                        booleanQuery.Add(clause);
                    }

                    resultQuery = booleanQuery;
                }
                else
                {
                    // search all documents, without filter or clause
                    resultQuery = new MatchAllDocsQuery(null);
                }
            }
            else
            {
                foreach (var clause in _clauses)
                    booleanQuery.Add(clause);

                if (_filters.Count > 0)
                {
                    var filter = new BooleanQuery();
                    foreach (var clause in _filters)
                        filter.Add(clause);
                    var queryFilter = new QueryWrapperFilter(filter);

                    resultQuery = new FilteredQuery(booleanQuery, queryFilter);
                }
            }

            Logger.DebugFormat("New search query: {0}", resultQuery.ToString());
            return resultQuery;
        }

        public IEnumerable<ISearchHit> Search()
        {
            var query = CreateQuery();

            IndexSearcher searcher;

            try
            {
                searcher = new IndexSearcher(_directory, true);
            }
            catch
            {
                // index might not exist if it has been rebuilt
                Logger.Info("Attempt to read a none existing index");
                return Enumerable.Empty<ISearchHit>();
            }

            using (searcher)
            {
                var sort = string.IsNullOrEmpty(_sort)
                               ? Sort.RELEVANCE
                               : new Sort(new SortField(_sort, _comparer, _sortDescending));
                var collector = TopFieldCollector.Create(
                    sort,
                    _count + _skip,
                    false,
                    true,
                    false,
                    true);

                Logger.DebugFormat("Searching: {0}", query.ToString());
                searcher.Search(query, collector);

                var results = collector.TopDocs().ScoreDocs
                                       .Skip(_skip)
                                       .Select(scoreDoc => new LuceneSearchHit(searcher.Doc(scoreDoc.Doc), scoreDoc.Score))
                                       .ToList();

                Logger.DebugFormat("Search results: {0}", results.Count);

                return results;
            }
        }

        public int Count()
        {
            var query = CreateQuery();
            IndexSearcher searcher;

            try
            {
                searcher = new IndexSearcher(_directory, true);
            }
            catch
            {
                // index might not exist if it has been rebuilt
                Logger.Info("Attempt to read a none existing index");
                return 0;
            }

            using (searcher)
            {
                var hits = searcher.Search(query, Int16.MaxValue);
                Logger.InfoFormat("Search results: {0}", hits.ScoreDocs.Length);
                var length = hits.ScoreDocs.Length;
                return Math.Min(length - _skip, _count);
            }
        }

        public ISearchBits GetBits()
        {
            var query = CreateQuery();
            IndexSearcher searcher;

            try
            {
                searcher = new IndexSearcher(_directory, true);
            }
            catch
            {
                // index might not exist if it has been rebuilt
                Logger.Info("Attempted to read a non-existing index");
                return null;
            }

            using (searcher)
            {
                var filter = new QueryWrapperFilter(query);
                var bits = filter.GetDocIdSet(searcher.IndexReader);
                var disi = new OpenBitSetDISI(bits.Iterator(), searcher.MaxDoc);
                return new SearchBits(disi);
            }
        }

        public ISearchHit Get(int documentId)
        {
            var query = new TermQuery(new Term("id", documentId.ToString(CultureInfo.InvariantCulture)));

            using (var searcher = new IndexSearcher(_directory, true))
            {
                var hits = searcher.Search(query, 1);
                Logger.InfoFormat("Search results: {0}", hits.ScoreDocs.Length);
                return hits.ScoreDocs.Length > 0 ? new LuceneSearchHit(searcher.Doc(hits.ScoreDocs[0].Doc), hits.ScoreDocs[0].Score) : null;
            }
        }
    }
}