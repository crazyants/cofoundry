﻿angular.module('cms.roles').controller('RoleListController', [
    '_',
    'shared.LoadState',
    'shared.SearchQuery',
    'shared.urlLibrary',
    'roles.roleService',
function (
    _,
    LoadState,
    SearchQuery,
    urlLibrary,
    rolesService) {

    var vm = this;

    init();

    function init() {
        
        vm.urlLibrary = urlLibrary;
        vm.gridLoadState = new LoadState();
        vm.query = new SearchQuery({
            onChanged: onQueryChanged
        });
        vm.filter = vm.query.getFilters();
        vm.toggleFilter = toggleFilter;

        toggleFilter(false);

        loadGrid();
    }

    /* ACTIONS */

    function toggleFilter(show) {
        vm.isFilterVisible = _.isUndefined(show) ? !vm.isFilterVisible : show;
    }

    /* EVENTS */

    function onQueryChanged() {
        toggleFilter(false);
        loadGrid();
    }

    /* PRIVATE FUNCS */
    
    function loadGrid() {
        vm.gridLoadState.on();

        return rolesService.getAll(vm.query.getParameters()).then(function (result) {
            vm.result = result;
            vm.gridLoadState.off();
        });
    }

}]);