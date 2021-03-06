﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Cofoundry.Core.DependencyInjection;

namespace Cofoundry.Domain
{
    /// <summary>
    /// Factory for creating role initializers to avoid exposing IResolutionContext
    /// directly.
    /// </summary>
    public interface IRoleInitializerFactory
    {
        /// <summary>
        /// Creates an instance of a role initializer for the specified role
        /// definition if one has been implemented; otherwise returns null
        /// </summary>
        /// <typeparam name="TRoleDefinition">The role to find an initializer for</typeparam>
        /// <returns>IRoleInitializer if one has been implemented; otherwise null</returns>
        IRoleInitializer Create(IRoleDefinition roleDefinition);
    }
}
