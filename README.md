# Widget Add Shapefile for ArcGIS API for JavaScript

This is a widget for ArcGIS API for Javascript 4. It allows you add a shapefile. It works **only for 2D map** for the moment.

With this widget, you can add a shapefile to your map. The symbology is automatic with the smart mapping.

**One shapefile per zip folder and limits to 4000 features**

![](shpfile.gif)

## Installation

### Clone

- Clone this repo to your local machine using `https://github.com/qQsss777/arcgis-js4-widget-addshapefile.git`

### Setup
You must have a ArcGIS JS version >= 4.13.

It requires the installation of:
- TypeScript : https://www.typescriptlang.org/index.html#download-links
- gulp-cli : https://gulpjs.com/

You need the ArcGIS API for JavaScript Typings too : https://developers.arcgis.com/javascript/latest/guide/typescript-setup/index.html#install-the-arcgis-api-for-javascript-typings

>  install npm packages @types/arcgis-js-api

```shell
$ npm install -g typescript
$ npm install -g gulp-cli
$ npm install
```

To test it, you can follow this guide to use it : https://developers.arcgis.com/javascript/latest/sample-code/widgets-custom-recenter/index.html#4 (paragraph Reference and use the custom widget )


Then you can build the widget with running the command :

```shell
$ gulp
```
If you don't use ArcGIS Webpack Plugin don't forget to import first the widget & echarts in your html file.

```javascript
<script type="text/javascript">
    var dojoConfig = {
        paths: {
            dist: location.pathname.replace(/\/[^/]+$/, "") + "/dist"
        }
    };
</script>
<script src="https://js.arcgis.com/4.13/"></script>
```

Then you can use it in your js files. Don't forget the css !

---

## Configuration

This widget have many properties:
- view: represents map view
- urlPortal: url to your portal (string)

```javascript

const map = new Map({
    basemap: "satellite"
});


var view = new MapView({
    map: map,
    container: "app",
    zoom: 11,
    center: [-4.5696403, 48.4083868]
});

const myWidget = new AddShapefile({
    view: view,
    urlPortal: "https://www.arcgis.com"
  });
view.ui.add(myWidget, "top-right")

```

ArcGIS Widget is bases on MVC pattern (https://developers.arcgis.com/javascript/latest/sample-code/widgets-custom-widget/index.html) so you can use only the viewmodel if you want. The properties are the same, just two more to display or not :
- selectContainer (string)
- addContainer (addcontainer)

---

## License

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)



