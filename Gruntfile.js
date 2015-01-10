module.exports = function(grunt) {
    'use strict';

    grunt.initConfig({

        clean: {
            options: {
                force: true
            },

            pre_dist: {
                src: ['dist/']
            },

            dist: {
                src: [
                    'dist/css/**/*.css',
                    '!dist/css/main.css',
                    'dist/css/**/*.map',
                    'dist/sass/',
                    'dist/.sass-cache/'
                ]
            }
        },

        jshint: {
            all: ['js/**/*.js'],
            jshintrc: 'jshint.json'
        },

        requirejs: {
            compile: {
                options: {
                    appDir: './src',
                    baseUrl: './src/js',
                    dir: 'dist',
                    modules: [
                        {
                            name: 'main'
                        }
                    ],
                    fileExclusionRegExp: /^(r|build|node_modules|Gruntfile)(\.js)?$/,
                    optimizeCss: 'none',
                    removeCombined: true,
                    mainConfigFile: './src/js/main.js',
                    waitSeconds: 30
                }
            }
        },

        compass: {
            dist: {
                options: {
                    sassDir: 'src/sass',
                    cssDir: 'src/css',
                    imagesDir: 'src/images',
                    fontsDir: 'src/fonts',
                    outputStyle: 'compressed',
                    relativeAssets: true,
                    noLineComments: true,
                    environment: 'production',
                    sourcemap: true
                }
            },

            dev: {
                options: {
                    sassDir: 'src/sass',
                    cssDir: 'src/css',
                    imagesDir: 'src/images',
                    fontsDir: 'src/fonts',
                    relativeAssets: true,
                    environment: 'development',
                    sourcemap: true
                }
            }
        },

        cssmin: {
            dist: {
                files: {
                    'dist/css/main.css': ['css/main.css']
                }
            }
        },

        concat: {
            css: {
                src: [
				    'src/css/styles.css',
                    '!src/css/main.css'
                ],
                dest: 'css/main.css'
            }
        },

        watch: {
            css: {
                files: ['src/sass/**/*.scss', 'src/sass/**/*.sass'],
                tasks: ['compass:dev', 'concat:css']
            }
        }
    });

    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);

    grunt.registerTask('default', ['compass:dev', 'concat:css']);

    grunt.registerTask('hint', ['compass:dev', 'jshint', 'inlinelint']);

    grunt.registerTask('minify',
        [
            'clean:pre_dist', 'compass:dist', 'concat:css', 'requirejs', 'cssmin:dist', 'clean:dist'
        ]);
};
