﻿using System;
using System.Data;
using System.Data.OleDb;
using System.Data.SqlTypes;
using System.Linq;
using Kore.Collections.Generic;

namespace Kore.Data.Common
{
    internal static class DbTypeConverter
    {
        private static Lazy<TupleHashSet<DbType, Type>> netTypes;
        private static Lazy<TupleHashSet<DbType, SqlDbType>> sqlDbTypes;
        private static Lazy<TupleHashSet<DbType, OleDbType>> oleDbTypes;

        static DbTypeConverter()
        {
            netTypes = new Lazy<TupleHashSet<DbType, Type>>(() =>
            {
                var hashSet = new TupleHashSet<DbType, Type>();
                hashSet.Add(DbType.AnsiString, typeof(String));
                hashSet.Add(DbType.AnsiStringFixedLength, typeof(Char));
                hashSet.Add(DbType.Binary, typeof(Byte[]));
                hashSet.Add(DbType.Boolean, typeof(Boolean));
                hashSet.Add(DbType.Byte, typeof(Byte));
                hashSet.Add(DbType.Currency, typeof(Decimal));
                hashSet.Add(DbType.Date, typeof(DateTime));
                hashSet.Add(DbType.DateTime, typeof(DateTime));
                hashSet.Add(DbType.DateTime2, typeof(DateTime));
                hashSet.Add(DbType.DateTimeOffset, typeof(DateTimeOffset));
                hashSet.Add(DbType.Decimal, typeof(Decimal));
                hashSet.Add(DbType.Double, typeof(Double));
                hashSet.Add(DbType.Guid, typeof(Guid));
                hashSet.Add(DbType.Int16, typeof(Int16));
                hashSet.Add(DbType.Int32, typeof(Int32));
                hashSet.Add(DbType.Int64, typeof(Int64));
                hashSet.Add(DbType.Object, typeof(Object));
                hashSet.Add(DbType.SByte, typeof(SByte));
                hashSet.Add(DbType.Single, typeof(Single));
                hashSet.Add(DbType.String, typeof(String));
                hashSet.Add(DbType.StringFixedLength, typeof(Char));
                hashSet.Add(DbType.Time, typeof(TimeSpan));
                hashSet.Add(DbType.UInt16, typeof(UInt16));
                hashSet.Add(DbType.UInt32, typeof(UInt32));
                hashSet.Add(DbType.UInt64, typeof(UInt64));
                hashSet.Add(DbType.VarNumeric, typeof(Int32));
                hashSet.Add(DbType.Xml, typeof(SqlXml));
                return hashSet;
            });
            sqlDbTypes = new Lazy<TupleHashSet<DbType, SqlDbType>>(() =>
            {
                var hashSet = new TupleHashSet<DbType, SqlDbType>();
                hashSet.Add(DbType.AnsiString, SqlDbType.VarChar);
                hashSet.Add(DbType.AnsiStringFixedLength, SqlDbType.Char);
                hashSet.Add(DbType.Binary, SqlDbType.Binary);
                hashSet.Add(DbType.Boolean, SqlDbType.Bit);
                hashSet.Add(DbType.Byte, SqlDbType.TinyInt);
                hashSet.Add(DbType.Currency, SqlDbType.Money);
                hashSet.Add(DbType.Date, SqlDbType.Date);
                hashSet.Add(DbType.DateTime, SqlDbType.DateTime);
                hashSet.Add(DbType.DateTime2, SqlDbType.DateTime2);
                hashSet.Add(DbType.DateTimeOffset, SqlDbType.DateTimeOffset);
                hashSet.Add(DbType.Decimal, SqlDbType.Decimal);
                hashSet.Add(DbType.Double, SqlDbType.Float);
                hashSet.Add(DbType.Guid, SqlDbType.UniqueIdentifier);
                hashSet.Add(DbType.Int16, SqlDbType.SmallInt);
                hashSet.Add(DbType.Int32, SqlDbType.Int);
                hashSet.Add(DbType.Int64, SqlDbType.BigInt);
                hashSet.Add(DbType.Object, SqlDbType.Variant);
                hashSet.Add(DbType.SByte, SqlDbType.TinyInt);
                hashSet.Add(DbType.Single, SqlDbType.Real);
                hashSet.Add(DbType.String, SqlDbType.NVarChar);
                hashSet.Add(DbType.StringFixedLength, SqlDbType.NChar);
                hashSet.Add(DbType.Time, SqlDbType.Time);
                hashSet.Add(DbType.UInt16, SqlDbType.SmallInt);
                hashSet.Add(DbType.UInt32, SqlDbType.Int);
                hashSet.Add(DbType.UInt64, SqlDbType.BigInt);
                hashSet.Add(DbType.VarNumeric, SqlDbType.Int);
                hashSet.Add(DbType.Xml, SqlDbType.Xml);
                return hashSet;
            });
            oleDbTypes = new Lazy<TupleHashSet<DbType, OleDbType>>(() =>
            {
                var hashSet = new TupleHashSet<DbType, OleDbType>();
                hashSet.Add(DbType.AnsiString, OleDbType.VarChar);
                hashSet.Add(DbType.AnsiStringFixedLength, OleDbType.Char);
                hashSet.Add(DbType.Binary, OleDbType.Binary);
                hashSet.Add(DbType.Boolean, OleDbType.Boolean);
                hashSet.Add(DbType.Byte, OleDbType.UnsignedTinyInt);
                hashSet.Add(DbType.Currency, OleDbType.Currency);
                hashSet.Add(DbType.Date, OleDbType.Date);
                hashSet.Add(DbType.DateTime, OleDbType.DBTimeStamp);
                hashSet.Add(DbType.DateTime2, OleDbType.DBTimeStamp);
                hashSet.Add(DbType.DateTimeOffset, OleDbType.VarChar);
                hashSet.Add(DbType.Decimal, OleDbType.Decimal);
                hashSet.Add(DbType.Double, OleDbType.Double);
                hashSet.Add(DbType.Guid, OleDbType.Guid);
                hashSet.Add(DbType.Int16, OleDbType.SmallInt);
                hashSet.Add(DbType.Int32, OleDbType.Integer);
                hashSet.Add(DbType.Int64, OleDbType.BigInt);
                hashSet.Add(DbType.Object, OleDbType.Variant);
                hashSet.Add(DbType.SByte, OleDbType.TinyInt);
                hashSet.Add(DbType.Single, OleDbType.Single);
                hashSet.Add(DbType.String, OleDbType.VarChar);
                hashSet.Add(DbType.StringFixedLength, OleDbType.Char);
                hashSet.Add(DbType.Time, OleDbType.DBTime);
                hashSet.Add(DbType.UInt16, OleDbType.UnsignedSmallInt);
                hashSet.Add(DbType.UInt32, OleDbType.UnsignedInt);
                hashSet.Add(DbType.UInt64, OleDbType.UnsignedBigInt);
                hashSet.Add(DbType.VarNumeric, OleDbType.VarNumeric);
                hashSet.Add(DbType.Xml, OleDbType.VarChar);
                return hashSet;
            });
        }

        public static Type ToSystemType(DbType dbType)
        {
            return netTypes.Value.First(x => x.Item1 == dbType).Item2;
        }

        public static SqlDbType ToSqlDbType(DbType dbType)
        {
            return sqlDbTypes.Value.First(x => x.Item1 == dbType).Item2;
        }

        public static OleDbType ToOleDbType(DbType dbType)
        {
            return oleDbTypes.Value.First(x => x.Item1 == dbType).Item2;
        }
    }
}