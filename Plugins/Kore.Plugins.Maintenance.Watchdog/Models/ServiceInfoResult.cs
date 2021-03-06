﻿using System.Runtime.Serialization;

namespace Kore.Plugins.Maintenance.Watchdog.Models
{
    [DataContract]
    public class ServiceInfoResult
    {
        [DataMember]
        public int WatchdogInstanceId { get; set; }

        [DataMember]
        public string ServiceName { get; set; }

        [DataMember]
        public string DisplayName { get; set; }

        [DataMember]
        public string Status { get; set; }

        [DataMember]
        public bool IsWatched { get; set; }
    }
}