// Karma configuration
// Generated on Tue Feb 02 2016 10:28:32 GMT-0600 (CST)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '../../..',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
	  'target/nwc/js/webjars/META-INF/resources/webjars/**/jquery.js',
	  'target/nwc/js/webjars/META-INF/resources/webjars/**/bootstrap.js',
	  'target/nwc/js/webjars/META-INF/resources/webjars/**/select2.js',
	  'target/nwc/js/webjars/META-INF/resources/webjars/**/jquery.js',
	  'target/nwc/js/webjars/META-INF/resources/webjars/**/sugar.min.js',
	  'target/nwc/js/webjars/META-INF/resources/webjars/**/underscore.js',
	  'target/nwc/js/webjars/META-INF/resources/webjars/**/backbone.js',
	  'target/nwc/js/webjars/META-INF/resources/webjars/**/handlebars.js',
	  'target/nwc/js/webjars/META-INF/resources/webjars/**/OpenLayers.debug.js',
	  'target/nwc/js/webjars/META-INF/resources/webjars/**/javascript.util.js',
	  'target/nwc/js/webjars/META-INF/resources/webjars/**/jsts.js',
	  'src/main/webapp/vendorlibs/FileSaver.js-master/FileSaver.js',
      'src/main/webapp/js/utils/*.js',
	  'src/main/webapp/js/model/BaseSelectMapModel.js',
	  'src/main/webapp/js/model/*.js',
	  'src/main/webapp/js/view/BaseView.js',
	  'src/main/webapp/js/view/BaseSelectMapView.js',
	  'src/main/webapp/js/view/BaseDiscoveryTabView.js',
	  'src/main/webapp/js/view/WaterbudgetPlotView.js',
	  'src/main/webapp/js/view/CountyWaterUseView.js',
	  'src/main/webapp/js/view/WaterBudgetHucDataView.js',
	  'src/main/webapp/js/view/ProjectTabView.js',
	  'src/main/webapp/js/view/DataTabView.js',
	  'src/main/webapp/js/view/PublicationsTabView.js',
	  'src/main/webapp/js/view/StreamflowPlotView.js',
	  'src/main/webapp/js/**/*.js',
	  'src/test/javascript/vendor/*.js',
	  'src/test/javascript/specs/*.js'
    ],


    // list of files to exclude
    exclude: [
      'src/main/webapp/js/init.js',
	  'src/main/webapp/js/utils/openLayersExtensions/**/*.js',
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: [],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
