/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import { subclass, declared, property, aliasOf } from "esri/core/accessorSupport/decorators";

import Widget from "esri/widgets/Widget";

import { tsx } from "esri/widgets/support/widget";
import MapView = require('esri/views/MapView');
import SceneView = require('esri/views/SceneView');
import AddShapefileViewModel = require('./AddShapefileViewModel');

interface IAddShapefileProperties extends __esri.WidgetProperties {
    view: MapView | SceneView,
    urlPortal: string
}

const CSS = {
    base: "esri-addshapefile",
    form: "esri-addshapefile__form",
    inputFile: "esri-addshapefile__input",
    group: "esri-addshapefile__group",
    groupLabel: "esri-addshapefile__group-label",
    inputLabel: "esri-addshapefile__input-label",

    // common
    widget: "esri-widget",
    panel: "esri-widget--panel",
    input: "esri-input",
    select: "esri-select",
    button: "esri-button"
};

@subclass("esri.widgets.barchartwidget")
class AddShapefile extends declared(Widget) {
    constructor(properties?: IAddShapefileProperties) {
        super();
    }

    @aliasOf("viewModel.urlPortal")
    urlPortal: string

    @aliasOf("viewModel.view")
    view: MapView | null

    @aliasOf("viewModel.addContainer")
    addContainer: string

    @aliasOf("viewModel.selectContainer")
    selectContainer: string

    @property({
        type: AddShapefileViewModel
    })
    viewModel: AddShapefileViewModel = new AddShapefileViewModel();

    postInitialize() {
        this.selectContainer = "selectField";
        this.addContainer = "addcontainer"
    }

    render() {
        const classBase = this.classes(
            CSS.base,
            CSS.widget,
            CSS.panel
        );

        const classGroup = this.classes(
            CSS.group
        );

        const classInput = this.classes(
            CSS.input,
            CSS.inputFile
        );

        const classInputLabel = this.classes(
            CSS.inputLabel
        );

        const classGroupLabel = this.classes(
            CSS.groupLabel
        );

        const classSelect = this.classes(
            CSS.select
        );
        const classAddButton = this.classes(
            CSS.button
        )


        return (
            <div class={classBase}>
                <form class={CSS.form} novalidate enctype="multipart/form-data" method="post" id="uploadForm">
                    <div class={classGroup}>
                        <label class={classGroupLabel} for="uploadForm">1. Ajoutez un shapefile zippé</label>
                        <input class={classInput} type="file" name="file" id="inFile" onchange={this._handleSubmit} />
                        <label for="inFile" class={classInputLabel}>Choississez un .zip</label>
                    </div>
                    <div class={classGroup}>
                        <label class={classGroupLabel} for="selectField">2. Sélectionnez un champ pour la symbologie</label>
                        <select id="selectField" class={classSelect} disabled>
                            <option selected="selected">Emplacement</option>
                        </select>
                    </div>
                    <div class={classGroup}>
                        <label class={classGroupLabel} for="">3. Ajoutez à la carte</label>
                        <button class={classAddButton} id="addcontainer" disabled>Ajoutez le shapefile</button>
                    </div>
                </form>
            </div>
        )
    }
    private _handleSubmit = this.viewModel.onAddShp
}
export = AddShapefile;