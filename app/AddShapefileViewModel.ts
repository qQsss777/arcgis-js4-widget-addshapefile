/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import { subclass, declared, property } from "esri/core/accessorSupport/decorators";

import Accessor = require('esri/core/Accessor');
import MapView = require('esri/views/MapView');
import SceneView = require('esri/views/SceneView');
import rendererJsonUtils = require("esri/renderers/support/jsonUtils");
import FeatureLayer = require('esri/layers/FeatureLayer');
import Field = require('esri/layers/support/Field');
import locationRendererCreator = require("esri/renderers/smartMapping/creators/location");
import typeRendererCreator = require("esri/renderers/smartMapping/creators/type");

interface IAddShapefileViewModelProperties extends __esri.WidgetProperties {
    view: MapView | SceneView,
    urlPortal: string,
    selectContainer: string,
    addContainer: string,
}

@subclass("esri.widgets.barchartwidget")
class AddShapefileViewModel extends declared(Accessor) {
    constructor(properties?: IAddShapefileViewModelProperties) {
        super();
    }

    //--------------------------------------------------------------------
    //
    //  Properties
    //
    //--------------------------------------------------------------------
    @property()
    view: MapView | SceneView;

    @property()
    urlPortal: string

    @property()
    selectContainer: string

    @property()
    addContainer: string

    @property()
    valueSelected: string

    @property()
    featureLayer: FeatureLayer


    //public method
    onAddShp = (event: Event) => {
        //format name of the file
        const shapefile: string = (event.target as HTMLInputElement).value.toLowerCase();
        shapefile.indexOf(".zip") !== -1 ? this._generateFeatureCollection(shapefile) : console.log("pas de .zip");
    }

    //private method
    private _generateFeatureCollection = async (file: string) => {
        const name: Array<string> = file.split(".");
        //Chrome and IE add c:\fakepath to the value - we need to remove it
        //See this link for more info: http://davidwalsh.name/fakepath
        const nameFormat: string = name[0].replace("c:\\fakepath\\", "");

        const input = document.querySelector('input[type="file"]') as HTMLInputElement;
        const fileList = input.files as FileList;
        const data = fileList[0] as File;

        //Define the input params for generate see the rest doc for details
        //http://www.arcgis.com/apidocs/rest/index.html?generate.html
        var params: any = {
            'name': nameFormat,
            'targetSR': this.view.spatialReference,
            'maxRecordCount': 4000,
            'enforceInputFileSizeLimit': true,
            'enforceOutputJsonSizeLimit': true
        };

        // initiliaze FormData to pass it with the Fetch API
        const formdata: FormData = new FormData();
        formdata.append('filetype', 'shapefile');
        formdata.append('publishParameters', JSON.stringify(params));
        formdata.append('f', 'json');
        formdata.append('file', data);

        //don't forget proxy or enable CORS
        const url: string = `${this.urlPortal}/sharing/rest/content/features/generate`;
        try {
            const response = await fetch(url, {
                method: 'post',
                body: formdata,
            });
            //get json
            const json: any = await response.json();
            //if data, we'll add it
            json ? this._addShpToMap(json.featureCollection) : console.log("Pas de donnée dans le shp");
        } catch (error) {
            console.error('Error:', error);
        }
    }

    private _addShpToMap = async (featureCollection: any) => {
        //this widget run with the first shapefile present in the .zip (for the moment)
        const layer = featureCollection.layers[0];
        let features = []
        //initialize a FeatureLayer with params
        this.featureLayer = new FeatureLayer({
            renderer: rendererJsonUtils.fromJSON(layer.layerDefinition.drawingInfo.renderer),
            objectIdField: layer.layerDefinition.objectIdField,
            popupEnabled: true,
            outFields: ['*'],
            legendEnabled: true,
            title: layer.layerDefinition.name
        });

        //geometry type conditions
        switch (layer.featureSet.geometryType) {
            case 'esriGeometryPoint':
                features = await this._createCollectionPoint(layer);
                break;

            case 'esriGeometryPolyline':
                features = await this._createCollectionPolyline(layer);
                break;

            case 'esriGeometryPolygon':
                features = await this._createCollectionPolygon(layer);
                break;
            default:
                console.log('Not a valid shapefile');
        }

        //transform list of the fields
        const listFields = layer.layerDefinition.fields.map((field: any) => {
            field = Field.fromJSON(field)
            return field
        });

        //add features collection
        this.featureLayer.source = features;

        //add fields
        this.featureLayer.fields = listFields;

        //next step consists in define symbology
        this._chooseSymbology(listFields)

        //add event listener for the run button and activate it
        const addNodeElement = document.getElementById(this.addContainer) as HTMLButtonElement
        addNodeElement.addEventListener("click", this._onClick)
        addNodeElement.disabled = false;

        //go to the extent of the layer
        this.view.extent = featureCollection.layers[0].layerDefinition.extent
        //activate the defaut popup
        this.view.popup.defaultPopupTemplateEnabled = true
    }

    private _createCollectionPoint = (layer: any): Promise<any> => {
        //initialize array
        const features: Array<any> = []
        //for each feature set, create object point feature and add it to the array
        layer.featureSet.features.forEach((feature: any) => {
            const geometry = {
                type: "point",
                x: feature.geometry.x,
                y: feature.geometry.y,
                z: feature.geometry.z,
                spatialReference: feature.geometry.spatialReference
            };
            const graphic = {
                geometry,
                attributes: feature.attributes
            }
            features.push(graphic);
        });
        return Promise.resolve(features)
    }

    private _createCollectionPolyline = (layer: any): Promise<any> => {
        //initialize array
        const features: Array<any> = []
        //for each feature set, create object polyline feature and add it to the array
        layer.featureSet.features.forEach((feature: any) => {
            const geometry = {
                type: "polyline",
                paths: feature.geometry.paths,
                spatialReference: feature.geometry.spatialReference
            };
            const graphic = {
                geometry,
                attributes: feature.attributes
            }
            features.push(graphic);
        });
        return Promise.resolve(features)
    }


    private _createCollectionPolygon = (layer: any): Promise<any> => {
        //initialize array
        const features: Array<any> = []
        //for each feature set, create object polygon feature and add it to the array
        layer.featureSet.features.forEach((feature: any) => {
            const geometry = {
                type: "polygon",
                rings: feature.geometry.rings,
                spatialReference: feature.geometry.spatialReference
            };
            const graphic = {
                geometry,
                attributes: feature.attributes
            }
            features.push(graphic);
        });
        return Promise.resolve(features)
    }

    private _chooseSymbology = (listFields: Array<Field>) => {
        //get select, activate and add options
        const nodeListe = document.getElementById(this.selectContainer) as HTMLSelectElement;
        this.valueSelected = nodeListe.options[nodeListe.selectedIndex].value;
        nodeListe.disabled = false;

        //options from fields, get only string (for the moment)
        listFields.forEach(field => {
            if (field.type === "string") {
                const el = document.createElement("option");
                el.textContent = field.name;
                el.value = field.name;
                nodeListe.appendChild(el);
            }
        })
    }

    private _onClick = (e: Event): void => {
        //location renderer or per type
        const nodeListe = document.getElementById(this.selectContainer) as HTMLSelectElement;
        this.valueSelected = nodeListe.options[nodeListe.selectedIndex].value;
        this.valueSelected === "Emplacement" ? this._applySimpleSymbology(this.featureLayer) : this._applyUniqueSymbology(this.featureLayer);

        //disable and keep first option select
        nodeListe.options.length = 1;
        nodeListe.options[0].selected = true;
        nodeListe.disabled = true;

        //disable button
        const runButton = e.target as HTMLButtonElement;
        runButton.disabled = true;
    }

    private _applySimpleSymbology = async (featureLayer: FeatureLayer) => {
        // simple visualization to indicate features with a single symbol
        this.view.map.add(this.featureLayer);
        var params = {
            layer: featureLayer,
            view: this.view
        };
        // when the promise resolves, apply the renderer to the layer
        const renderer = await locationRendererCreator.createRenderer(params);
        featureLayer.renderer = renderer.renderer;
    }

    private _applyUniqueSymbology = async (featureLayer: FeatureLayer) => {
        // visualization per type based on field value
        this.view.map.add(this.featureLayer);
        //featurelayer must be in map because we need featurelayer view to create renderer
        const params: any = {
            layer: featureLayer,
            field: this.valueSelected,
            view: this.view,
            numTypes: -1,
            sortBy: 'value',
            defaultSymbolEnabled: true
        };
        const renderer = await typeRendererCreator.createRenderer(params);
        // when the promise resolves, apply the renderer to the layer
        featureLayer.renderer = renderer.renderer;
    }
}
export = AddShapefileViewModel;