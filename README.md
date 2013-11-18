# grunt-build-html

> Build HTML templates recursively.

## Getting Started
This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-build-html --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-build-html');
```

## The "build_html" task

### Overview
In your project's Gruntfile, add a section named `build_html` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  build_html: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
})
```

### Options

#### option.data
Type: `String|Object`
Default: `{}`

An object containing data that will be available in all templates (files and partials).
You may also pass a JSON filepath as a string.

```js
options: {
  data: 'data.json'
}
```

#### options.templates
Type: `String|Array`
Default: `[]`

Lets you specify which files you want to be available as partials you can include in files or in other partials (avoid infinite loops). 
Globbing supported.

```js
options: {
   templates: 'dev/fragments/**/*.html'
}
```

#### templateSettings
Type: `Object`
Default: `null`

The settings passed to underscore when compiling templates.

```js
options: {
  templateSettings: {
    interpolate : /\{\{(.+?)\}\}/g
  }
}
```

#### options.templateNamespaceRoot
Type: `String`
Default: `null`

If empty, templates will simply be loaded with their filename as template key (without extension and regardless of the templates folder structure).
If you set the templates root folder, it will serve as the key origin :

* template : test/fragments/subfolder/my-content.html
* templateNamespaceRoot : test/fragments
* template key : subfolder/my-content

### Usage Examples

```js
grunt.initConfig({
  build_html: {
    dev: {
      options: {
        templates: 'dev/fragments/**/*.html'
      },
      expand: true,
      cwd: 'dev/',
      src: ['*.html'],
      dest: 'staging/',
      ext: '.html'
    }
  }
})
```

#### Basic example
In all templates (files and partials) you can use the `include` special method to include a partials :

```
<%= include('my-content') %>
```

#### Example with parameters
You can also set extra parameters that will be available in the included template.

`dev/my-page.html` :
```
<%= include('head', {title: 'My page'}) %>
```

`dev/fragments/head.html` :
```
<meta charset="utf-8"/>
<title><%- title %></title>
```

#### Recursive example
In this example we will define a list of templates that will be processed using a list template that will simply iterate over the parameter to include and concatenate all templates.

`dev/my-page.html` :
```
<%= include('list', {params: ['header', 'my-page-content', 'footer']}) %>
```

`dev/fragments/list.html` :
```
<%= _.map(params, function(key){return include(key);}).join('\n')  %>
```

### Troubleshooting
You can launch your task with the `--debug` option to get more debug informations.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History

 * 2013-11-19   v0.1.0   Initial release.
