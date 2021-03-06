﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace Cofoundry.Domain
{
    public static class ImageAssetConstants
    {
        public static readonly string FileContainerName = "Images";
        public static readonly Dictionary<string, string> PermittedImageTypes;

        static ImageAssetConstants()
        {
            PermittedImageTypes = new Dictionary<string, string>();
            foreach(var ext in new string[] { ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff", ".tif" })
            {
                PermittedImageTypes.Add(ext, MimeMapping.GetMimeMapping(ext));
            }
        }
    }
}
