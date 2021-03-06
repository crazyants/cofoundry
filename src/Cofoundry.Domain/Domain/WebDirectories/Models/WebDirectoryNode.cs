﻿using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;

namespace Cofoundry.Domain
{
    public class WebDirectoryNode : ICreateAudited
    {
        public int WebDirectoryId { get; set; }

        public string Name { get; set; }

        public int? ParentWebDirectoryId { get; set; }

        [XmlIgnore]
        [JsonIgnore]
        public WebDirectoryNode ParentWebDirectory { get; set; }

        public IEnumerable<WebDirectoryNode> ChildWebDirectories { get; set; }

        /// <summary>
        /// The Path of this web directory (excluding parent directory path)
        /// </summary>
        public string UrlPath { get; set; }

        /// <summary>
        /// The number of pages directly associated with this web 
        /// directory i.e. excludes child directory pages.
        /// </summary>
        public int NumPages { get; set; }
        
        /// <summary>
        /// The zero base depth of this directory in the tree stucture
        /// </summary>
        public int Depth { get; set; }

        /// <summary>
        /// The full (relative) url of this WebDirectory
        /// excluding the trailing slash.
        /// </summary>
        public string FullUrlPath { get; set; }

        public CreateAuditData AuditData { get; set; }

        /// <summary>
        /// Flattens out the Node and it's children into a single enumerable.
        /// </summary>
        /// <returns>This instance and any child nodes recursively.</returns>
        public IEnumerable<WebDirectoryNode> Flatten()
        {
            yield return this;

            foreach (var childNode in ChildWebDirectories)
            foreach (var flattenedNode in childNode.Flatten())
            {
                yield return flattenedNode;
            }
        }
    }
}
