﻿angular.module('cms.customEntities').controller('CustomEntityDetailsController', [
    '$routeParams',
    '$q',
    '$location',
    '_',
    'shared.LoadState',
    'shared.modalDialogService',
    'shared.entityVersionModalDialogService',
    'shared.customEntityService',
    'shared.urlLibrary',
    'customEntities.modulePath',
    'customEntities.options',
function (
    $routeParams,
    $q,
    $location,
    _,
    LoadState,
    modalDialogService,
    entityVersionModalDialogService,
    customEntityService,
    urlLibrary,
    modulePath,
    moduleOptions
    ) {

    var vm = this,
        nameSingularLowerCase = moduleOptions.nameSingular.toLowerCase(),
        entityDialogConfig = {
            entityNameSingular: moduleOptions.nameSingular,
            isCustomEntity: true
        },
        modelMetaData;

    init();

    /* INIT */

    function init() {

        // UI actions
        vm.edit = edit;
        vm.save = save.bind(null, false);
        vm.saveAndPublish = save.bind(null, true);
        vm.cancel = reset;
        vm.publish = publish;
        vm.unpublish = unpublish;
        vm.discardDraft = discardDraft;
        vm.copyToDraft = copyToDraft;
        vm.deleteCustomEntity = deleteCustomEntity;
        vm.changeUrl = changeUrl;

        // Properties
        vm.editMode = false;
        vm.globalLoadState = new LoadState();
        vm.saveLoadState = new LoadState();
        vm.saveAndPublishLoadState = new LoadState();
        vm.formLoadState = new LoadState(true);
        vm.options = moduleOptions;
        vm.urlLibrary = urlLibrary;
        vm.saveButtonText = moduleOptions.autoPublish ? 'Save' : 'Save & Publish';
        vm.canChangeUrl = !moduleOptions.autoGenerateUrlSlug || moduleOptions.hasLocale;

        // Init
        initData(vm.formLoadState);
    }


    /* UI ACTIONS */

    function edit() {
        vm.editMode = true;
        vm.mainForm.formStatus.clear();
    }

    function save(publish) {
        var loadState;

        if (publish) {
            vm.updateCommand.publish = true;
            loadState = vm.saveAndPublishLoadState;
        } else {
            loadState = vm.saveLoadState;
        }

        setLoadingOn(loadState);

        customEntityService.updateDraft(vm.updateCommand)
            .then(onSuccess.bind(null, 'Changes were saved successfully'))
            .finally(setLoadingOff.bind(null, loadState));
    }

    function reset() {
        vm.editMode = false;
        vm.updateCommand = mapUpdateCommand(vm.customEntity);
        vm.mainForm.formStatus.clear();
    }

    function publish() {

        entityVersionModalDialogService
            .publish(vm.customEntity.customEntityId, setLoadingOn, entityDialogConfig)
            .then(onSuccess.bind(null, moduleOptions.nameSingular + ' published successfully.'))
            .catch(setLoadingOff);
    }

    function unpublish() {

        entityVersionModalDialogService
            .unpublish(vm.customEntity.customEntityId, setLoadingOn, entityDialogConfig)
            .then(onSuccess.bind(null, 'The ' + nameSingularLowerCase + ' has been unpublished and reverted to draft state.'))
            .catch(setLoadingOff);

    }

    function discardDraft() {
        var options = {
            title: 'Discard Version',
            message: 'Are you sure you want to discard this draft? This will discard all changes since it was last published.',
            okButtonTitle: 'Yes, discard it',
            onOk: onOk
        };

        modalDialogService
            .confirm(options)
            .then(onSuccess.bind(null, 'Draft discarded successfully'));

        function onOk() {
            setLoadingOn();
            return customEntityService.removeDraft(vm.customEntity.customEntityId);
        }
    }

    function copyToDraft(version) {
        var hasDraftVersion = !!getDraftVersion();

        entityVersionModalDialogService
            .copyToDraft(vm.customEntity.customEntityId, version.customEntityVersionId, hasDraftVersion, setLoadingOn, entityDialogConfig)
            .then(onOkSuccess)
            .catch(setLoadingOff);

        function onOkSuccess() {
            onSuccess('Draft created successfully.')
        }
    }

    function deleteCustomEntity() {
        var options = {
            title: 'Delete ' + moduleOptions.nameSingular,
            message: 'Are you sure you want to delete this ' + nameSingularLowerCase + '?',
            okButtonTitle: 'Yes, delete it',
            onOk: onOk
        };

        modalDialogService.confirm(options);

        function onOk() {
            setLoadingOn();
            return customEntityService
                .remove(vm.customEntity.customEntityId)
                .then(redirectToList)
                .catch(setLoadingOff);
        }
    }
    
    function changeUrl() {

        modalDialogService.show({
            templateUrl: modulePath + 'routes/modals/changeurl.html',
            controller: 'ChangeUrlController',
            options: {
                customEntity: vm.customEntity,
                onSave: onSuccess.bind(null, 'Url Changed')
            }
        });
    }

    /* PRIVATE FUNCS */

    function onSuccess(message, loadStateToTurnOff) {
        return initData(loadStateToTurnOff)
            .then(vm.mainForm.formStatus.success.bind(null, message));
    }

    function getDraftVersion() {
        return _.find(vm.versions, function (version) {
            return version.workFlowStatus === 'Draft';
        });
    }

    function initData(loadStateToTurnOff) {

        return $q
            .all([getCustomEntity(), getVersions(), getMetaData()])
            .then(onLoaded)
            .then(setLoadingOff.bind(null, loadStateToTurnOff));

        /* helpers */

        function onLoaded(results) {
            var customEntity = results[0],
                versions = results[1];

            modelMetaData = results[2];

            vm.customEntity = customEntity;
            vm.versions = versions;
            vm.updateCommand = mapUpdateCommand(customEntity);

            if (vm.customEntity.locale) {
                vm.additionalParameters = {
                    localeId: vm.customEntity.locale.localeId
                };
            } else {
                vm.additionalParameters = {};
            }

            vm.editMode = false;
        }

        function getMetaData() {
            return customEntityService.getDataModelSchema(moduleOptions.customEntityDefinitionCode);
        }

        function getCustomEntity() {
            return customEntityService.getById($routeParams.id);
        }

        function getVersions() {
            return customEntityService.getVersionsByCustomEntityId($routeParams.id);
        }
    }
    
    function mapUpdateCommand(customEntity) {

        var command = {
            customEntityId: customEntity.customEntityId,
            title: customEntity.latestVersion.title,
            model: angular.copy(customEntity.latestVersion.model)
        }

        vm.formDataSource = {
            model: command.model,
            modelMetaData: modelMetaData
        }

        return command;
    }

    function redirectToList() {
        $location.path('');
    }

    function setLoadingOn(loadState) {
        vm.globalLoadState.on();
        if (loadState && _.isFunction(loadState.on)) loadState.on();
    }

    function setLoadingOff(loadState) {
        vm.globalLoadState.off();

        if (loadState && _.isFunction(loadState.off)) loadState.off();
    }
}]);