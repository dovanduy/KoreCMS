using System;
using System.Collections.Generic;
using System.Linq;
using Kore.Data;
using Kore.Tasks.Domain;

namespace Kore.Tasks.Services
{
    /// <summary>
    /// Task service
    /// </summary>
    public partial class ScheduledTaskService : IScheduledTaskService
    {
        #region Fields

        private readonly IRepository<ScheduledTask> taskRepository;

        #endregion Fields

        #region Ctor

        public ScheduledTaskService(IRepository<ScheduledTask> taskRepository)
        {
            this.taskRepository = taskRepository;
        }

        #endregion Ctor

        #region Methods

        /// <summary>
        /// Deletes a task
        /// </summary>
        /// <param name="task">Task</param>
        public virtual void DeleteTask(ScheduledTask task)
        {
            if (task == null)
                throw new ArgumentNullException("task");

            taskRepository.Delete(task);
        }

        /// <summary>
        /// Gets a task
        /// </summary>
        /// <param name="taskId">Task identifier</param>
        /// <returns>Task</returns>
        public virtual ScheduledTask GetTaskById(int taskId)
        {
            if (taskId == 0)
                return null;

            return taskRepository.Find(taskId);
        }

        /// <summary>
        /// Gets a task by its type
        /// </summary>
        /// <param name="type">Task type</param>
        /// <returns>Task</returns>
        public virtual ScheduledTask GetTaskByType(string type)
        {
            if (String.IsNullOrWhiteSpace(type))
                return null;

            var query = taskRepository.Table;
            query = query.Where(st => st.Type == type);
            query = query.OrderByDescending(t => t.Id);

            var task = query.FirstOrDefault();
            return task;
        }

        /// <summary>
        /// Gets all tasks
        /// </summary>
        /// <param name="showHidden">A value indicating whether to show hidden records</param>
        /// <returns>Tasks</returns>
        public virtual IList<ScheduledTask> GetAllTasks(bool showHidden = false)
        {
            var query = taskRepository.Table;
            if (!showHidden)
            {
                query = query.Where(t => t.Enabled);
            }
            query = query.OrderByDescending(t => t.Seconds);

            var tasks = query.ToList();
            return tasks;
        }

        /// <summary>
        /// Inserts a task
        /// </summary>
        /// <param name="task">Task</param>
        public virtual void InsertTask(ScheduledTask task)
        {
            if (task == null)
                throw new ArgumentNullException("task");

            taskRepository.Insert(task);
        }

        /// <summary>
        /// Updates the task
        /// </summary>
        /// <param name="task">Task</param>
        public virtual void UpdateTask(ScheduledTask task)
        {
            if (task == null)
                throw new ArgumentNullException("task");

            taskRepository.Update(task);
        }

        #endregion Methods
    }
}