//
// Dashboard
//

var allDefectsInfo;
var recentOrdersInit;

const port = process.env.PORT || 3000;
function ExcelDateToJSDate(serial) {
   var utc_days  = Math.floor(serial - 25569);
   var utc_value = utc_days * 86400;                                        
   var date_info = new Date(utc_value * 1000);

   var fractional_day = serial - Math.floor(serial) + 0.0000001;

   var total_seconds = Math.floor(86400 * fractional_day);

   var seconds = total_seconds % 60;

   total_seconds -= seconds;

   var hours = Math.floor(total_seconds / (60 * 60));
   var minutes = Math.floor(total_seconds / 60) % 60;

   return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds);
}

// Class definition
var KTDashboard = function() {

    /**Customize the Rectangle.prototype draw method**/
        Chart.elements.Rectangle.prototype.draw = function() {
              var ctx = this._chart.ctx;
              var vm = this._view;
              var left, right, top, bottom, signX, signY, borderSkipped, radius;
              var borderWidth = vm.borderWidth;

              // If radius is less than 0 or is large enough to cause drawing errors a max
              //      radius is imposed. If cornerRadius is not defined set it to 0.
              var cornerRadius = this._chart.config.options.cornerRadius;
              var fullCornerRadius = this._chart.config.options.fullCornerRadius;
              var stackedRounded = this._chart.config.options.stackedRounded;
              var typeOfChart = this._chart.config.type;

              if (cornerRadius < 0) {
                cornerRadius = 0;
              }
              if (typeof cornerRadius == 'undefined') {
                cornerRadius = 0;
              }
              if (typeof fullCornerRadius == 'undefined') {
                fullCornerRadius = false;
              }
              if (typeof stackedRounded == 'undefined') {
                stackedRounded = false;
              }

              if (!vm.horizontal) {
                // bar
                left = vm.x - vm.width / 2;
                right = vm.x + vm.width / 2;
                top = vm.y;
                bottom = vm.base;
                signX = 1;
                signY = bottom > top ? 1 : -1;
                borderSkipped = vm.borderSkipped || 'bottom';
              } else {
                // horizontal bar
                left = vm.base;
                right = vm.x;
                top = vm.y - vm.height / 2;
                bottom = vm.y + vm.height / 2;
                signX = right > left ? 1 : -1;
                signY = 1;
                borderSkipped = vm.borderSkipped || 'left';
              }

              // Canvas doesn't allow us to stroke inside the width so we can
              // adjust the sizes to fit if we're setting a stroke on the line
              if (borderWidth) {
                // borderWidth shold be less than bar width and bar height.
                var barSize = Math.min(Math.abs(left - right), Math.abs(top - bottom));
                borderWidth = borderWidth > barSize ? barSize : borderWidth;
                var halfStroke = borderWidth / 2;
                // Adjust borderWidth when bar top position is near vm.base(zero).
                var borderLeft = left + (borderSkipped !== 'left' ? halfStroke * signX : 0);
                var borderRight = right + (borderSkipped !== 'right' ? -halfStroke * signX : 0);
                var borderTop = top + (borderSkipped !== 'top' ? halfStroke * signY : 0);
                var borderBottom = bottom + (borderSkipped !== 'bottom' ? -halfStroke * signY : 0);
                // not become a vertical line?
                if (borderLeft !== borderRight) {
                  top = borderTop;
                  bottom = borderBottom;
                }
                // not become a horizontal line?
                if (borderTop !== borderBottom) {
                  left = borderLeft;
                  right = borderRight;
                }
              }

              ctx.beginPath();
              ctx.fillStyle = vm.backgroundColor;
              ctx.strokeStyle = vm.borderColor;
              ctx.lineWidth = borderWidth;

              // Corner points, from bottom-left to bottom-right clockwise
              // | 1 2 |
              // | 0 3 |
              var corners = [
                [left, bottom],
                [left, top],
                [right, top],
                [right, bottom]
              ];

              // Find first (starting) corner with fallback to 'bottom'
              var borders = ['bottom', 'left', 'top', 'right'];
              var startCorner = borders.indexOf(borderSkipped, 0);
              if (startCorner === -1) {
                startCorner = 0;
              }

              function cornerAt(index) {
                return corners[(startCorner + index) % 4];
              }

              // Draw rectangle from 'startCorner'
              var corner = cornerAt(0);
              ctx.moveTo(corner[0], corner[1]);


              var nextCornerId, nextCorner, width, height, x, y;
              for (var i = 1; i < 4; i++) {
                corner = cornerAt(i);
                nextCornerId = i + 1;
                if (nextCornerId == 4) {
                  nextCornerId = 0
                }

                nextCorner = cornerAt(nextCornerId);

                width = corners[2][0] - corners[1][0];
                height = corners[0][1] - corners[1][1];
                x = corners[1][0];
                y = corners[1][1];

                var radius = cornerRadius;
                // Fix radius being too large
                if (radius > Math.abs(height) / 2) {
                  radius = Math.floor(Math.abs(height) / 2);
                }
                if (radius > Math.abs(width) / 2) {
                  radius = Math.floor(Math.abs(width) / 2);
                }

                  var x_tl, x_tr, y_tl, y_tr, x_bl, x_br, y_bl, y_br;
                  if (height < 0) {
                    // Negative values in a standard bar chart
                    x_tl = x;
                    x_tr = x + width;
                    y_tl = y + height;
                    y_tr = y + height;

                    x_bl = x;
                    x_br = x + width;
                    y_bl = y;
                    y_br = y;

                    // Draw
                    ctx.moveTo(x_bl + radius, y_bl);

                    ctx.lineTo(x_br - radius, y_br);

                    // bottom right
                    ctx.quadraticCurveTo(x_br, y_br, x_br, y_br - radius);


                    ctx.lineTo(x_tr, y_tr + radius);

                    // top right
                    fullCornerRadius ? ctx.quadraticCurveTo(x_tr, y_tr, x_tr - radius, y_tr) : ctx.lineTo(x_tr, y_tr, x_tr - radius, y_tr);


                    ctx.lineTo(x_tl + radius, y_tl);

                    // top left
                    fullCornerRadius ? ctx.quadraticCurveTo(x_tl, y_tl, x_tl, y_tl + radius) : ctx.lineTo(x_tl, y_tl, x_tl, y_tl + radius);


                    ctx.lineTo(x_bl, y_bl - radius);

                    //  bottom left
                    ctx.quadraticCurveTo(x_bl, y_bl, x_bl + radius, y_bl);

                  } else if (width < 0) {
                    // Negative values in a horizontal bar chart
                    x_tl = x + width;
                    x_tr = x;
                    y_tl = y;
                    y_tr = y;

                    x_bl = x + width;
                    x_br = x;
                    y_bl = y + height;
                    y_br = y + height;

                    // Draw
                    ctx.moveTo(x_bl + radius, y_bl);

                    ctx.lineTo(x_br - radius, y_br);

                    //  Bottom right corner
                    fullCornerRadius ? ctx.quadraticCurveTo(x_br, y_br, x_br, y_br - radius) : ctx.lineTo(x_br, y_br, x_br, y_br - radius);

                    ctx.lineTo(x_tr, y_tr + radius);

                    // top right Corner
                    fullCornerRadius ? ctx.quadraticCurveTo(x_tr, y_tr, x_tr - radius, y_tr) : ctx.lineTo(x_tr, y_tr, x_tr - radius, y_tr);

                    ctx.lineTo(x_tl + radius, y_tl);

                    // top left corner
                    ctx.quadraticCurveTo(x_tl, y_tl, x_tl, y_tl + radius);

                    ctx.lineTo(x_bl, y_bl - radius);

                    //  bttom left corner
                    ctx.quadraticCurveTo(x_bl, y_bl, x_bl + radius, y_bl);

                  } else {
                  
                      var lastVisible = 0;
                    for (var findLast = 0, findLastTo = this._chart.data.datasets.length; findLast < findLastTo; findLast++) {
                      if (!this._chart.getDatasetMeta(findLast).hidden) {
                        lastVisible = findLast;
                      }
                    }
                    var rounded = this._datasetIndex === lastVisible;

                    if (rounded) {
                    //Positive Value
                      ctx.moveTo(x + radius, y);

                      ctx.lineTo(x + width - radius, y);

                      // top right
                      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);


                      ctx.lineTo(x + width, y + height - radius);

                      // bottom right
                      if (fullCornerRadius || typeOfChart == 'horizontalBar')
                        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
                      else
                        ctx.lineTo(x + width, y + height, x + width - radius, y + height);


                      ctx.lineTo(x + radius, y + height);

                      // bottom left
                      if (fullCornerRadius)
                        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
                      else
                        ctx.lineTo(x, y + height, x, y + height - radius);


                      ctx.lineTo(x, y + radius);

                      // top left
                      if (fullCornerRadius || typeOfChart == 'bar')
                        ctx.quadraticCurveTo(x, y, x + radius, y);
                      else
                        ctx.lineTo(x, y, x + radius, y);
                    }else {
                      ctx.moveTo(x, y);
                      ctx.lineTo(x + width, y);
                      ctx.lineTo(x + width, y + height);
                      ctx.lineTo(x, y + height);
                      ctx.lineTo(x, y);
                    }
                  }
                
              }

              ctx.fill();
              if (borderWidth) {
                ctx.stroke();
              }
            };

    var mediumCharts = function() {
        KTLib.initMediumChart('kt_widget_mini_chart_1', [20, 45, 20, 10, 20, 35, 20, 25, 10, 10], 70, KTApp.getStateColor('brand'));
        KTLib.initMediumChart('kt_widget_mini_chart_2', [10, 15, 25, 45, 15, 30, 10, 40, 15, 25], 70, KTApp.getStateColor('danger'));
        KTLib.initMediumChart('kt_widget_mini_chart_3', [22, 15, 40, 10, 35, 20, 30, 50, 15, 10], 70, KTApp.getBaseColor('shape', 4));
    }

    var latestProductsMiniCharts = function() {
        KTLib.initMiniChart($('#kt_widget_latest_products_chart_1'), [6, 12, 9, 18, 15, 9, 11, 8], KTApp.getStateColor('info'), 2, false, false);
        KTLib.initMiniChart($('#kt_widget_latest_products_chart_2'), [8, 6, 13, 16, 9, 6, 11, 14], KTApp.getStateColor('warning'), 2, false, false);
        KTLib.initMiniChart($('#kt_widget_latest_products_chart_3'), [8, 6, 13, 16, 9, 6, 11, 14], KTApp.getStateColor('warning'), 2, false, false);
        KTLib.initMiniChart($('#kt_widget_latest_products_chart_4'), [3, 9, 9, 18, 15, 9, 11, 8], KTApp.getStateColor('success'), 2, false, false);
        KTLib.initMiniChart($('#kt_widget_latest_products_chart_5'), [5, 7, 9, 18, 15, 9, 11, 8], KTApp.getStateColor('brand'), 2, false, false);
        KTLib.initMiniChart($('#kt_widget_latest_products_chart_6'), [3, 9, 5, 18, 15, 7, 11, 6], KTApp.getStateColor('danger'), 2, false, false);
    }

    var generalStatistics = function() {
        // Mini charts
        KTLib.initMiniChart($('#kt_widget_general_statistics_chart_1'), [6, 8, 3, 18, 15, 7, 11, 7], KTApp.getStateColor('warning'), 2, false, false);
        KTLib.initMiniChart($('#kt_widget_general_statistics_chart_2'), [8, 6, 9, 18, 15, 7, 11, 16], KTApp.getStateColor('brand'), 2, false, false);
        KTLib.initMiniChart($('#kt_widget_general_statistics_chart_3'), [4, 12, 9, 18, 15, 7, 11, 12], KTApp.getStateColor('danger'), 2, false, false);
        KTLib.initMiniChart($('#kt_widget_general_statistics_chart_4'), [3, 14, 5, 12, 15, 8, 14, 16], KTApp.getStateColor('success'), 2, false, false);

        // Main chart
        if (!document.getElementById("kt_widget_general_statistics_chart_main")) {
            return;
        }

        var ctx = document.getElementById("kt_widget_general_statistics_chart_main").getContext("2d");

        var gradient1 = ctx.createLinearGradient(0, 0, 0, 350);
        gradient1.addColorStop(0, Chart.helpers.color(KTApp.getStateColor('brand')).alpha(0.3).rgbString());
        gradient1.addColorStop(1, Chart.helpers.color(KTApp.getStateColor('brand')).alpha(0).rgbString());

        var gradient2 = ctx.createLinearGradient(0, 0, 0, 350);
        gradient2.addColorStop(0, Chart.helpers.color(KTApp.getStateColor('danger')).alpha(0.3).rgbString());
        gradient2.addColorStop(1, Chart.helpers.color(KTApp.getStateColor('danger')).alpha(0).rgbString());

        var mainConfig = {
            type: 'line',
            data: {
                labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October'],
                datasets: [{
                    label: 'Sales',
                    borderColor: KTApp.getStateColor('brand'),
                    borderWidth: 2,
                    backgroundColor: gradient1,
                    pointBackgroundColor: KTApp.getStateColor('brand'),
                    data: [30, 60, 25, 7, 5, 15, 30, 20, 15, 10],
                }, {
                    label: 'Orders',
                    borderWidth: 1,
                    borderColor: KTApp.getStateColor('danger'),
                    backgroundColor: gradient2,
                    pointBackgroundColor: KTApp.getStateColor('danger'),
                    data: [10, 15, 25, 35, 15, 30, 55, 40, 65, 40]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                title: {
                    display: false,
                    text: ''
                },
                tooltips: {
                    enabled: true,
                    intersect: false,
                    mode: 'nearest',
                    bodySpacing: 5,
                    yPadding: 10,
                    xPadding: 10, 
                    caretPadding: 0,
                    displayColors: false,
                    backgroundColor: KTApp.getStateColor('brand'),
                    titleFontColor: '#ffffff', 
                    cornerRadius: 4,
                    footerSpacing: 0,
                    titleSpacing: 0
                },
                legend: {
                    display: false,
                    labels: {
                        usePointStyle: false
                    }
                },
                hover: {
                    mode: 'index'
                },
                scales: {
                    xAxes: [{
                        display: false,
                        scaleLabel: {
                            display: false,
                            labelString: 'Month'
                        },
                        ticks: {
                            display: false,
                            beginAtZero: true
                        }
                    }],
                    yAxes: [{
                        display: true,
                        stacked: false,
                        scaleLabel: {
                            display: false,
                            labelString: 'Value'
                        },
                        gridLines: {
                            color: '#eef2f9',
                            drawBorder: false,
                            offsetGridLines: true,
                            drawTicks: false
                        },
                        ticks: {
                            display: false,
                            beginAtZero: true
                        }
                    }]
                },
                elements: {
                    point: {
                        radius: 0,
                        borderWidth: 0,
                        hoverRadius: 0,
                        hoverBorderWidth: 0
                    }
                },
                layout: {
                    padding: {
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 0
                    }
                }
            }
        };

        var chart = new Chart(ctx, mainConfig);

        // Update chart on window resize
        KTUtil.addResizeHandler(function() {
            chart.update();
        });
    }
    
    


    var widgetTechnologiesChart2 = function() {
        if ($('#kt_widget_technologies_chart_2').length == 0) {
            return;
        }

        var randomScalingFactor = function() {
            return Math.round(Math.random() * 100);
        };

        var config = {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [
                        35, 30, 35
                    ],
                    backgroundColor: [                                                                 
                        KTApp.getStateColor('warning'),
                        KTApp.getStateColor('brand'),
                        KTApp.getStateColor('success')
                    ]
                }],
                labels: [       
                    'CSS',     
                    'Angular',               
                    'HTML'    
                ]
            },
            options: {
                cutoutPercentage: 75,
                responsive: true,
                maintainAspectRatio: false,
                legend: {
                    display: false,
                    position: 'top',
                },
                title: {
                    display: false,
                    text: 'Technology'
                },
                animation: {
                    animateScale: true,
                    animateRotate: true
                },
                tooltips: {
                    enabled: true,
                    intersect: false,
                    mode: 'nearest',
                    bodySpacing: 5,
                    yPadding: 10,
                    xPadding: 10, 
                    caretPadding: 0,
                    displayColors: false,
                    backgroundColor: KTApp.getStateColor('brand'),
                    titleFontColor: '#ffffff', 
                    cornerRadius: 4,
                    footerSpacing: 0,
                    titleSpacing: 0
                }
            }
        };

        var ctx = document.getElementById('kt_widget_technologies_chart_2').getContext('2d');
        var myDoughnut = new Chart(ctx, config);
    }

    var widgetTotalOrdersChart = function() {
        if (!document.getElementById('kt_widget_total_orders_chart')) {
            return;
        }

        // Main chart
        var max = 80;
        var color = KTApp.getStateColor('brand');
        var ctx = document.getElementById('kt_widget_total_orders_chart').getContext("2d");
        var gradient = ctx.createLinearGradient(0, 0, 0, 120);
        gradient.addColorStop(0, Chart.helpers.color(color).alpha(0.3).rgbString());
        gradient.addColorStop(1, Chart.helpers.color(color).alpha(0).rgbString());

        var data = [30, 35, 45, 65, 35, 50, 40, 60, 35, 45];

        var mainConfig = {
            type: 'line',
            data: {
                labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October'],
                datasets: [{
                    label: 'Orders',
                    borderColor: color,
                    borderWidth: 3,
                    backgroundColor: gradient,
                    pointBackgroundColor: KTApp.getStateColor('brand'),
                    data: data,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                title: {
                    display: false,
                    text: 'Stacked Area'
                },
                tooltips: {
                    enabled: true,
                    intersect: false,
                    mode: 'nearest',
                    bodySpacing: 5,
                    yPadding: 10,
                    xPadding: 10, 
                    caretPadding: 0,
                    displayColors: false,
                    backgroundColor: KTApp.getStateColor('brand'),
                    titleFontColor: '#ffffff', 
                    cornerRadius: 4,
                    footerSpacing: 0,
                    titleSpacing: 0
                },
                legend: {
                    display: false,
                    labels: {
                        usePointStyle: false
                    }
                },
                hover: {
                    mode: 'index'
                },
                scales: {
                    xAxes: [{
                        display: false,
                        scaleLabel: {
                            display: false,
                            labelString: 'Month'
                        },
                        ticks: {
                            display: false,
                            beginAtZero: true,
                        }
                    }],
                    yAxes: [{
                        display: false,
                        scaleLabel: {
                            display: false,
                            labelString: 'Value'
                        },
                        gridLines: {
                            color: '#eef2f9',
                            drawBorder: false,
                            offsetGridLines: true,
                            drawTicks: false
                        },
                        ticks: {
                            max: max,
                            display: false,
                            beginAtZero: true
                        }
                    }]
                },
                elements: {
                    point: {
                        radius: 0,
                        borderWidth: 0,
                        hoverRadius: 0,
                        hoverBorderWidth: 0
                    }
                },
                layout: {
                    padding: {
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 0
                    }
                }
            }
        };

        var chart = new Chart(ctx, mainConfig);

        // Update chart on window resize
        KTUtil.addResizeHandler(function() {
            chart.update();
        });
    }

    var widgetTotalOrdersChart2 = function() {
        if (!document.getElementById('kt_widget_total_orders_chart_2')) {
            return;
        }

        // Main chart
        var max = 80;
        var color = KTApp.getStateColor('danger');
        var ctx = document.getElementById('kt_widget_total_orders_chart_2').getContext("2d");
        var gradient = ctx.createLinearGradient(0, 0, 0, 120);
        gradient.addColorStop(0, Chart.helpers.color(color).alpha(0.3).rgbString());
        gradient.addColorStop(1, Chart.helpers.color(color).alpha(0).rgbString());

        var data = [30, 35, 45, 65, 35, 50, 40, 60, 35, 45];

        var mainConfig = {
            type: 'line',
            data: {
                labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October'],
                datasets: [{
                    label: 'Orders',
                    borderColor: color,
                    borderWidth: 3,
                    backgroundColor: gradient,
                    pointBackgroundColor: KTApp.getStateColor('brand'),
                    data: data,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                title: {
                    display: false,
                    text: 'Stacked Area'
                },
                tooltips: {
                    enabled: true,
                    intersect: false,
                    mode: 'nearest',
                    bodySpacing: 5,
                    yPadding: 10,
                    xPadding: 10, 
                    caretPadding: 0,
                    displayColors: false,
                    backgroundColor: KTApp.getStateColor('brand'),
                    titleFontColor: '#ffffff', 
                    cornerRadius: 4,
                    footerSpacing: 0,
                    titleSpacing: 0
                },
                legend: {
                    display: false,
                    labels: {
                        usePointStyle: false
                    }
                },
                hover: {
                    mode: 'index'
                },
                scales: {
                    xAxes: [{
                        display: false,
                        scaleLabel: {
                            display: false,
                            labelString: 'Month'
                        },
                        ticks: {
                            display: false,
                            beginAtZero: true,
                        }
                    }],
                    yAxes: [{
                        display: false,
                        scaleLabel: {
                            display: false,
                            labelString: 'Value'
                        },
                        gridLines: {
                            color: '#eef2f9',
                            drawBorder: false,
                            offsetGridLines: true,
                            drawTicks: false
                        },
                        ticks: {
                            max: max,
                            display: false,
                            beginAtZero: true
                        }
                    }]
                },
                elements: {
                    point: {
                        radius: 0,
                        borderWidth: 0,
                        hoverRadius: 0,
                        hoverBorderWidth: 0
                    }
                },
                layout: {
                    padding: {
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 0
                    }
                }
            }
        };

        var chart = new Chart(ctx, mainConfig);

        // Update chart on window resize
        KTUtil.addResizeHandler(function() {
            chart.update();
        });
    }

    var daterangepickerInit = function() {
        if ($('#kt_dashboard_daterangepicker').length == 0) {
            return;
        }

        var picker = $('#kt_dashboard_daterangepicker');
        var start = moment();
        var end = moment();

        function cb(start, end, label) {
            var title = '';
            var range = '';

            if ((end - start) < 100 || label == 'Today') {
                title = 'Today:';
                range = start.format('MMM D');
            } else if (label == 'Yesterday') {
                title = 'Yesterday:';
                range = start.format('MMM D');
            } else {
                range = start.format('MMM D') + ' - ' + end.format('MMM D');
            }

            picker.find('#kt_dashboard_daterangepicker_date').html(range);
            picker.find('#kt_dashboard_daterangepicker_title').html(title);
        }

        picker.daterangepicker({
            direction: KTUtil.isRTL(),
            startDate: start,
            endDate: end,
            opens: 'left',
            applyClass: "btn btn-sm btn-primary",
            cancelClass: "btn btn-sm btn-secondary",
            ranges: {
                'Today': [moment(), moment()],
                'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                'This Month': [moment().startOf('month'), moment().endOf('month')],
                'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
            }
        }, cb);

        cb(start, end, '');
    }

    return {
        init: function() {
            mediumCharts();

            latestProductsMiniCharts();
            daterangepickerInit();
            generalStatistics();
            
            //recentOrdersInit();

            
            widgetTechnologiesChart2()
            widgetTotalOrdersChart();
            widgetTotalOrdersChart2();

            //widgetRevenueGrowthChart();
        }
    };
}();

var datatable;
var allDefectsTable = function() {
        if ($('#kt_recent_orders').length === 0) {
            return;
        }

        datatable = $('#kt_recent_orders').KTDatatable({
            data: {
                type: 'local',
                source: allDefectsInfo.issues,
                pageSize: 10,
                saveState: {
                    cookie: false,
                    webstorage: true
                },
                serverPaging: false,
                serverFiltering: false,
                serverSorting: false
            },

            layout: {
                scroll: true,
                height: 615,
                footer: false
            },

            sortable: true,

            filterable: false,

            pagination: true,

            search: {
              input: $('#generalSearch'),
            },

            columns: [{
                field: "DEFECT_ID",
                title: "Defect ID",
                sortable: true,
                width: 80,
                template: function(data) {
                    return '<span><a href="https://dchelix.atlassian.net/browse/'+data.DEFECT_ID+'">' + data.DEFECT_ID + '</a></span>';
                },
                textAlign: 'center'
            }, {
                field: "EPIC",
                title: "Functional Set",
                width: 180,
                autoHide: false,
                // callback function support for column rendering
                template: function(data) {
                    var epicText = "";

                    if (data.FS != undefined) {
                      data.FS.forEach(function(o) {
                        if (o.value != "All") {
                          if(epicText.length > 0) {
                            epicText += ", ";
                          }
                          epicText += o.value;
                        }                          
                      });
                    }
                    
                    if (epicText.length == 0) {
                      if (EpicMapping[data.EPIC] != undefined) {
                        epicText = EpicMapping[data.EPIC];
                      } else {
                        epicText = data.EPIC;
                      }  
                    }                   

                    return '<span class="kt-font-bold" style="max-width:190px">' + epicText + '</span>';
                }
            }, {
                field: "DESCRIPTION",
                title: "Description",
                width: 360,
                template: function(data) {
                    return '<span>' + data.SUMMARY + '</span>';
                }
            }, {
                field: "SEVERITY",
                title: "Severity",
                width: 75,
                // callback function support for column rendering
                template: function(data) {
                    var dTitle;
                    var dClass;

                    if (data.SEVERITY == "Level 1 - Critical") {
                      dTitle = 'Critical';
                      dClass = 'btn-label-danger';
                    }
                    if (data.SEVERITY == "Level 2 - Major") {
                      dTitle = 'Major';
                      dClass = 'btn-label-warning';
                    }
                    if (data.SEVERITY == "Level 3 - Minor") {
                      dTitle = 'Minor';
                      dClass = 'btn-label-success';
                    }
                    if (data.SEVERITY == "Level 4 - Cosmetic") {
                      dTitle = 'Cosmetic';
                      dClass = 'btn-label-brand';
                    }                    
                    return '<span class="btn btn-bold btn-sm btn-font-sm ' + dClass + '">' + dTitle + '</span>';
                }
            },
            {
                field: "Aging",
                title: "",
                width: 25,
                // callback function support for column rendering
                template: function(data, i) {
                  var days;
                  if (openStatus.indexOf(data.STATUS) >= 0) {
                    var days = Math.round((new Date().getTime() - new Date(data.CREATED_DATE).getTime()) / (1000 * 3600 * 24));
                  }
                  return '<span class="badge badge-pill">'+NVL(days,"")+'</span>';
                }
            },

             {
                field: "STATUS",
                title: "Status",
                width: 110,
                // callback function support for column rendering
                template: function(data, i) {
                  var text = data.STATUS;
                  if (text == 'Open/New') { text = 'Open'; data.STATUS = 'Open'; }
                  return '<span class="badge badge-pill '+statusPill[data.STATUS]+'">' + text + '</span>';
                }


            }, {
                field: "ASSIGNED",
                title: "Assignee",
                width: 180,
                // callback function support for column rendering
                template: function(data, i) {
                   var textHtml = '<div style="line-height:1.25rem">';
                   if (data.ASSIGNED != undefined) {
                      var team = teamMapping[data.ASSIGNED.replace(/ *\([^)]*\) */g, "")];
                      if (team == undefined) {
                        team = "";
                      }
                      textHtml += '<span class="" style="font-size:1.1rem !important">' + data.ASSIGNED.replace(/ *\([^)]*\) */g, "") + '</span>';
                      textHtml += '<br><span class="kt-user-card-v2__desc" style="font-size:10px; text-transform:uppercase;">'+team+'</span>';
                   } else {
                      textHtml += '<span class="" style="font-size:1.1rem !important; color: #bbb"><i>Unassigned</i></span>';
                   }
                   textHtml += '</div>';
                   return textHtml;
                }
            },{
                field: "CREATED_DATE",
                title: "Created",
                width: 100,
                // callback function support for column rendering
                template: function(data, i) {
                   return '<span class="kt-font-bold">' + new Date(data.CREATED_DATE).toLocaleDateString("pt-PT") + '</span>';
                }

            },{
                field: "ENVIROMENT",
                title: "Environment",
                width: 95,
                sortable: false,
                autoHide: false,
                overflow: 'visible',
                template: function(data) {
                    return '<span class="kt-font-bold">' + data.ENVIROMENT ? data.ENVIROMENT : "" + '</span>';
                }
            }]
        });

        $('#kt_form_sev').on('change', function() {
            datatable.search($(this).val().toLowerCase(), 'SEVERITY');
        });

        $('#kt_form_team').on('change', function() {
            datatable.search($(this).val().toLowerCase(), 'TEAM');
        });

        $('#kt_form_status').on('change', function() {
            datatable.search($(this).val().toLowerCase(), 'STATUS');
        });

        $('#kt_form_sev,#kt_form_status,#kt_form_team').selectpicker();

        // Reload datatable layout on aside menu toggle
        if (KTLayout.getAsideSecondaryToggler && KTLayout.getAsideSecondaryToggler()) {
            KTLayout.getAsideSecondaryToggler().on('toggle', function() {
                datatable.redraw();
            });
        }
    }


var statusTableVar;
var statusTable = function() {
        if ($('#test_table').length === 0) {
            return;
        }

        var arrayT = [];
        var fsKeys = Object.keys(TestExecution);
        fsKeys.forEach(function(o) {
          if(TestExecution[o].TEAM != undefined && TestExecution[o].STATUS != 'Deprecated') {
            arrayT.push({fs:o, data:TestExecution[o]});
          }          
        });
        //console.log(arrayT[2].data.DOMAIN);

        statusTableVar = $('#test_table').KTDatatable({
            data: {
                type: 'local',
                source: arrayT,
                pageSize: 10,
                saveState: {
                    cookie: false,
                    webstorage: true
                },
                serverPaging: false,
                serverFiltering: false,
                serverSorting: false
            },

            layout: {
                scroll: true,
                height: 705,
                footer: false
            },

            sortable: true,

            filterable: false,

            pagination: true,

            search: {
              input: $('#fsSearch'),
            },

            columns: [{
                field: "data.RAG",
                title: "RAG",
                width: 40,
                autoHide: false,
                sortCallback: function (data, sort, column) {
                  var field = column['field'];
                  return $(data).sort(function (a, b) {
                      var aField = a.data.RAG;
                      var bField = b.data.RAG;
                      if (aField == 'R') aField = 1;
                      if (aField == 'A') aField = 2;
                      if (aField == 'G') aField = 3;
                      if (bField == 'R') bField = 1;
                      if (bField == 'A') bField = 2;
                      if (bField == 'G') bField = 3;
                      if (sort === 'asc') {
                          return aField > bField
                              ? 1 : aField < bField
                                  ? -1
                                  : 0;
                      } else {
                          return aField < bField
                              ? 1 : aField > bField
                                  ? -1
                                  : 0;
                      }
                  });
                },
                // callback function support for column rendering
                template: function(data) {   
                    switch(data.data.RAG) {
                      case "R":
                        return '<span class=\"badge badge-pill badge-danger\" style=\"font-size: 1.1rem !important; width: 28px; vertical-align: middle;\">R</span></div>' 
                        break;
                      case "A":
                        return '<span class=\"badge badge-pill badge-warning\" style=\"font-size: 1.1rem !important; width: 28px; color:white; vertical-align: middle;\">A</span></div>' 
                        break;
                      case "G":
                        return '<span class=\"badge badge-pill badge-success\" style=\"font-size: 1.1rem !important; width: 28px; vertical-align: middle;\">G</span></div>' 
                        break;
                      default:
                        return '<span class=\"badge badge-pill badge-secondary\" style=\"font-size: 1.1rem !important; width: 28px; vertical-align: middle;\">?</span></div>' 
                    } 
                }
            }, {
                field: "fs",
                title: "Functional Set",
                width: 420,
                autoHide: false,
                // callback function support for column rendering
                template: function(data) {
                    var epicText = "";              

                    return "<div class=\"kt-profile__main\" style=\"border:0px\"><div class=\"kt-profile__main-info\" style=\"margin: 0.5rem 0\"><div class=\"kt-profile__main-info-name list_fs\" style=\"font-weight: 400; font-size:1.5rem\">"+data.fs+"</div><div class=\"kt-profile__main-info-position\" style=\"font-weight: 300; font-size: 1.0rem; color:#999 !important;\">"+data.data.DOMAIN+"</div></div></div>";
                }
            }, {
                field: "data.TEAM",
                title: "Owner",
                width: 75,
                autoHide: false,                
                sortCallback: function (data, sort, column) {
                  var field = column['field'];
                  return $(data).sort(function (a, b) {
                      var aField = a.data.TEAM;
                      var bField = b.data.TEAM;
                      if (aField == 'PT')     aField = 1;
                      if (aField == 'PT/USI') aField = 2;
                      if (aField == 'USI')    aField = 3;
                      if (bField == 'PT')     bField = 1;
                      if (bField == 'PT/USI') bField = 2;
                      if (bField == 'USI')    bField = 3;
                      if (sort === 'asc') {
                          return aField > bField
                              ? 1 : aField < bField
                                  ? -1
                                  : 0;
                      } else {
                          return aField < bField
                              ? 1 : aField > bField
                                  ? -1
                                  : 0;
                      }
                  });
                },
                template: function(data) {
                    var epicText = "";              
                    var dColor = "badge-success";
                    if (data.data.TEAM == "PT/USI") {
                      dColor = "badge-dark";
                    }
                    if (data.data.TEAM == "USI") {
                      dColor = "badge-warning";
                    }
                    return '<span class="badge '+dColor+' kt-font-light"><i class="la la-flag"> </i> '+data.data.TEAM+'</span>';
                }
            }, 
            {
                field: "data.DESIGN",
                title: "Technical Design",
                width: 180,
                autoHide: false,
                sortCallback: function (data, sort, column) {
                  var field = column['field'];
                  return $(data).sort(function (a, b) {
                      var aField = a.data.DESIGN;
                      var bField = b.data.DESIGN;
                      if (sort === 'asc') {
                          return aField > bField
                              ? 1 : aField < bField
                                  ? -1
                                  : 0;
                      } else {
                          return aField < bField
                              ? 1 : aField > bField
                                  ? -1
                                  : 0;
                      }
                  });
                },
                // callback function support for column rendering
                template: function(data) {
                    var opacity = 'opacity: 1.0';
                    if (data.data.DESIGN == 0) {
                      opacity = 'opacity: 0.7';
                    }
                    return '<div style=\"display:none;\">'+data.data.DESIGN+'</div><div class="kt-widget-13__progress kt-widget-13" style="width:100%; '+opacity+'"><div class="kt-widget-13__foot" style="margin-top: 0.5rem"><div class="kt-widget-13__progress"><div class="kt-widget-13__progress-info"><div class="kt-widget-13__progress-status" style="font-size: 1rem"><i class="flaticon-file-1"></i> Technical Design</div><div><div style="font-weight: 600; float:left; padding: 0.1rem 0.3rem; border-radius: 5px; background-color: rgba(85, 120, 235, 0.1); color: #5578eb;"><span class="kt-opacity-7">'+data.data.DESIGN+' %</span></div></div></div><div class="progress" style="height: 6px;"><div class="progress-bar kt-bg-brand" role="progressbar" style="width: '+data.data.DESIGN+'%" aria-valuenow="'+data.data.DESIGN+'" aria-valuemin="0" aria-valuemax="100"></div></div></div></div></div>';
                }
            }, 
            {
                field: "data.DEV",
                title: "Build & UTC",
                width: 180,
                autoHide: false,
                sortCallback: function (data, sort, column) {
                  var field = column['field'];
                  return $(data).sort(function (a, b) {
                      var aField = a.data.DEV;
                      var bField = b.data.DEV;
                      if (sort === 'asc') {
                          return aField > bField
                              ? 1 : aField < bField
                                  ? -1
                                  : 0;
                      } else {
                          return aField < bField
                              ? 1 : aField > bField
                                  ? -1
                                  : 0;
                      }
                  });
                },
                // callback function support for column rendering
                template: function(data) {
                    var opacity = 'opacity: 1.0';
                    if (data.data.DEV == 0) {
                      opacity = 'opacity: 0.7';
                    }
                    return '<div style=\"display:none;\">'+data.data.DEV+'</div><div class="kt-widget-13__progress kt-widget-13" style="width:100%; '+opacity+'"><div class="kt-widget-13__foot" style="margin-top: 0.5rem"><div class="kt-widget-13__progress"><div class="kt-widget-13__progress-info"><div class="kt-widget-13__progress-status" style="font-size: 1rem"><i class="flaticon-tool"></i> Build and UTC</div><div><div style="font-weight: 600; float:left; background-color: rgba(29, 201, 183, 0.1); color: #1dc9b7; padding: 0.1rem 0.3rem; border-radius: 5px;"><span class="kt-opacity-7">'+data.data.DEV+' %</span></div></div></div><div class="progress" style="height: 6px;"><div class="progress-bar bg-success" role="progressbar" style="width: '+data.data.DEV+'%" aria-valuenow="'+data.data.DEV+'" aria-valuemin="0" aria-valuemax="100"></div></div></div></div></div>';
                }
            },
            {
                field: "Testing",
                title: "Testing",
                width: 180,
                autoHide: false,
                sortCallback: function (data, sort, column) {
                  var field = column['field'];
                  return $(data).sort(function (a, b) {
                      var aField = Math.round(a.data.Passed/a.data.Total*100);
                      if (a.data.Total == 0) aField = 0;
                      var bField = Math.round(b.data.Passed/b.data.Total*100);
                      if (b.data.Total == 0) bField = 0;
                      if (sort === 'asc') {
                          return aField > bField
                              ? 1 : aField < bField
                                  ? -1
                                  : 0;
                      } else {
                          return aField < bField
                              ? 1 : aField > bField
                                  ? -1
                                  : 0;
                      }
                  });
                },
                // callback function support for column rendering
                template: function(data) {
                    var pass_perc = Math.round(data.data.Passed/data.data.Total*100);
                    var opacity = 'opacity: 1.0';
                    var completeClass = '';
                    if (data.data.Total == 0) {
                      pass_perc = 0;
                      opacity = 'opacity: 0.7';
                    }
                    if (pass_perc == 100) {
                      completeClass = 'class="test_completed" '
                    }
                    return '<div '+completeClass+'style=\"display:none;\">'+pass_perc+'</div><div class="kt-widget-13__progress kt-widget-13" style="width:100%; '+opacity+'"><div class="kt-widget-13__foot" style="margin-top: 0.5rem"><div class="kt-widget-13__progress"><div class="kt-widget-13__progress-info"><div class="kt-widget-13__progress-status" style="font-size: 1rem"><i class="flaticon-medal"></i> Test Execution</div><div><div style="font-weight: 600; float:left; background-color: rgba(255, 184, 34, 0.1); color: #ffb822; padding: 0.1rem 0.3rem; border-radius: 5px;"><span class="kt-opacity-7">'+pass_perc+' %</span></div></div></div><div class="progress" style="height: 6px;"><div class="test_progress progress-bar bg-warning" role="progressbar" style="width: '+pass_perc+'%" aria-valuenow="'+pass_perc+'" aria-valuemin="0" aria-valuemax="100"></div></div></div></div></div>';
                }
            },
            {
                field: "data.STATUS",
                title: "Status",
                width: 250,
                autoHide: false,
                sortCallback: function (data, sort, column) {
                  var field = column['field'];
                  return $(data).sort(function (a, b) {
                      var aField = a.data.STATUS;
                      var bField = b.data.STATUS;
                      if (sort === 'asc') {
                          return aField > bField
                              ? 1 : aField < bField
                                  ? -1
                                  : 0;
                      } else {
                          return aField < bField
                              ? 1 : aField > bField
                                  ? -1
                                  : 0;
                      }
                  });
                },
                // callback function support for column rendering
                template: function(data) {
                    var dTitle = data.data.STATUS;
                    var dClass;
                    var cClass;

                    
                    if (data.data.STATUS == "FD Review") {
                      dClass = 'btn-label-brand';
                    }   
                    if (data.data.STATUS == "TD Elaboration") {
                      dClass = 'btn-label-warning';
                    }
                    if (data.data.STATUS == "Build IP") {
                      dClass = 'btn-label-success';
                    }
                    if (data.data.STATUS == "Build Done") {
                      if(Math.round(data.data.Passed/data.data.Total*100) ==  100) {
                        dTitle = 'Completed <i class="la la-star delivered"></i>';
                        dClass = 'btn-label-success greener2';
                      } else {
                        dTitle = 'Delivered <i class="la la-star-o delivered"></i>';
                        dClass = 'btn-label-success greener';
                      }                      
                      cClass = 'fs_completed';                      
                    } 
                    if (data.data.STATUS == "Not started") {
                      dClass = 'notstarted';
                    }                    
                    return '<span class="btn btn-bold btn-sm btn-font-sm ' + dClass + ' ' + cClass + '">' + dTitle + '</span>';
                }
            }]
        });

        $('#kt_update').on('change', function() {
            statusTableVar.search($(this).val().toLowerCase(), 'fs');
        });

        $('#kt_fs_team').on('change', function() {
            statusTableVar.search($(this).val().toLowerCase(), 'data.TEAM');
            $('button[data-id="kt_fs_team"]').removeClass().addClass('btn dropdown-toggle btn-light');
            if ($(this).val() == 'PT') {
              $('button[data-id="kt_fs_team"]').removeClass('btn-light').addClass('btn-success');
            }
            if ($(this).val() == 'USI') {
              $('button[data-id="kt_fs_team"]').removeClass('btn-light').addClass('btn-warning');
            }            
        });

        $('#kt_fs_domain').on('change', function() {
            statusTableVar.search($(this).val().toLowerCase(), 'data.DOMAIN');
            $('button[data-id="kt_fs_domain"]').removeClass().addClass('btn dropdown-toggle');
            $('button[data-id="kt_fs_domain"]').addClass(NVL(fsPill[$(this).val()],'btn-light').replace('badge-','btn-'));
        });

        $('#kt_update, #kt_fs_domain, #kt_fs_team').selectpicker();

        $('kt-datatable--on-layout-updated');

        // Reload datatable layout on aside menu toggle
        if (KTLayout.getAsideSecondaryToggler && KTLayout.getAsideSecondaryToggler()) {
            KTLayout.getAsideSecondaryToggler().on('toggle', function() {
                statusTableVar.redraw();
            });
        }        

        statusTableVar.on('kt-datatable--on-layout-updated', function () {
          var total = $('td[data-field="data.STATUS"]').length;
          var delivered = $('td span.fs_completed').length;
          var passed = 0;
            $('.test_progress').each(function(idx) {
              var px = $(this).attr('aria-valuenow');
              passed = Number(passed) + Number(px);
            });
          //console.log(passed);
          $('#total_delivered').html(delivered+'<span> / '+total+'</span>');
          $('#test_percentage').html(Math.round(passed/total)+'<span> %</span>');
          $('.test_completed').closest('.kt-datatable__row').addClass('tr_row_completed');

          $('.list_fs').on('click', function(e) {
                loadPage($('[page-title="'+$(e.target).html()+'"]'),true)
            });
        });
    }

 var randomScalingFactor = function() {
        return Math.round(Math.random() * 100);
    };

var widgetRevenueGrowthChart = function() {
    if (!document.getElementById('kt_chart_revenue_growth')) {
        return;
    }

    var color = Chart.helpers.color;
    AppCharts.defectProgress.barChartData = {
        labels: histLabels,
        datasets: [{
            label: 'Open',
            backgroundColor: color(KTApp.getStateColor('danger')).alpha(1).rgbString(),
            borderWidth: 0,
            data: histOpen
        }, {
            label: 'Fixed',
            backgroundColor: color(KTApp.getStateColor('fixed', 1)).alpha(0.5).rgbString(),
            borderWidth: 0,
            data: histFixed
        }, {
            label: 'Closed',
            backgroundColor: color(KTApp.getStateColor('metal', 1)).alpha(1).rgbString(),
            borderWidth: 0,
            data: histClosed
        }]
    };
    

    AppCharts.defectProgress.lineChartData = {
        labels: histLabels,
        datasets: [{
            label: 'Open',
            backgroundColor: color(KTApp.getStateColor('danger')).alpha(1).rgbString(),
            borderWidth: 0,
            data: histOpen,
            borderColor: KTApp.getStateColor('danger'),
            borderWidth: 3,
            backgroundColor: color(KTApp.getStateColor('danger')).alpha(0.01).rgbString(),
            fill: true
        },
        {
            label: 'Fixed',
            backgroundColor: color(KTApp.getStateColor('fixed')).alpha(0.5).rgbString(),
            borderWidth: 0,
            data: histFixed,
            borderColor: color(KTApp.getStateColor('fixed')).alpha(0.5).rgbString(),
            borderWidth: 3,
            backgroundColor: color(KTApp.getStateColor('fixed')).alpha(0.01).rgbString(),
            fill: true
        },
        {
            label: 'Closed',
            backgroundColor: color(KTApp.getStateColor('metal')).alpha(1).rgbString(),
            borderWidth: 0,
            data: histClosed,
            borderColor: KTApp.getStateColor('metal'),
            borderWidth: 3,
            backgroundColor: color(KTApp.getStateColor('metal')).alpha(0.1).rgbString(),
            fill: true
        }]
    };

    if (AppCharts.defectProgress.chartType == 'line') {
        AppCharts.defectProgress.chartData = AppCharts.defectProgress.lineChartData;
    } else {
        AppCharts.defectProgress.chartData = AppCharts.defectProgress.barChartData;

    }

    var ctx = document.getElementById('kt_chart_revenue_growth').getContext('2d');
    AppCharts.defectProgress.chart = new Chart(ctx, {
        type: AppCharts.defectProgress.chartType,
        data: AppCharts.defectProgress.chartData,
        options: {          
            plugins: {
              labels: {
                render: '',
                fontColor: '#ffffff',
                fontSize: '0',
                fontFamily: 'Poppins, Helvetica, sans-serif', 
                precision: 0
              }
            },
            responsive: true,
            maintainAspectRatio: false,
            legend: false,
            scales: {
                xAxes: [{
                    categoryPercentage: 0.50,
                    barPercentage: 0.75,
                    display: true,
                    scaleLabel: {
                        display: false,
                        labelString: 'Month'
                    },
                    gridLines: false,
                    ticks: {
                        display: true,
                        beginAtZero: true,
                        fontColor: KTApp.getBaseColor('shape', 3),
                        fontSize: 13,
                        padding: 10
                    }
                }],
                yAxes: [{
                    categoryPercentage: 0.35,
                    barPercentage: 0.70,
                    display: true,
                    scaleLabel: {
                        display: false,
                        labelString: 'Value'
                    },
                    gridLines: {
                        color: KTApp.getBaseColor('shape', 2),
                        drawBorder: false,
                        offsetGridLines: false,
                        drawTicks: false,
                        borderDash: [3, 4],
                        zeroLineWidth: 1,
                        zeroLineColor: KTApp.getBaseColor('shape', 2),
                        zeroLineBorderDash: [3, 4]
                    },
                    ticks: {       
                        display: true,
                        beginAtZero: true,
                        fontColor: KTApp.getBaseColor('shape', 3),
                        fontSize: 13,
                        padding: 10
                    }
                }]
            },
            title: {
                display: false
            },
            hover: {
                mode: 'index'
            },
            elements: {
                line: {
                    tension: 0
                },
                point: { 
                    radius: 1 
                }
            },
            tooltips: {
                enabled: true,
                intersect: false,
                mode: 'nearest',
                bodySpacing: 5,
                yPadding: 10,
                xPadding: 10, 
                caretPadding: 0,
                displayColors: false,
                backgroundColor: '#ffffff',
                titleFontColor: '#777',
                bodyFontColor: '#999', 
                borderWidth: 0.5,
                borderColor: '#aaa',
                cornerRadius: 4,
                footerSpacing: 0,
                titleSpacing: 0
            },
            layout: {
                padding: {
                    left: 0,
                    right: 0,
                    top: 5,
                    bottom: 5
                }
            }
        }
    });

    $('#progress_loading').hide();
    $('#last_updated').html('Last updated: <span style="color:#777">'+new Date(HistData[0].issues[0].SNAPSHOT_DATE).toLocaleDateString("pt-PT")+'</span>');

}


function getNameInitials(name) {
  var initials = name.match(/\b\w/g) || [];
  initials = ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();
  return initials;
}


var defectStatusPie = function() {
    if ($('#kt_widget_technologies_chart').length == 0) {
        return;
    }

    var randomScalingFactor = function() {
        return Math.round(Math.random() * 100);
    };

    var config = {
        type: 'doughnut',
        data: {
            datasets: [{
                data: defectsStatusData,
                backgroundColor: [
                     KTApp.getStateColor('danger'),                    
                    'rgba(5,170,240,0.3)',  
                    'rgba(5,170,240,0.6)',
                    'rgba(5,170,240,0.9)', 
                    'rgb(70,120,180)',   
                    'rgb(230,230,230)'
                ]
            }],
            labels: [
                'Open',
                'Fixed',
                'Testing',
                'Reviewing',
                'Closed',
                'Not a bug'
            ]
        },
        options: {
            plugins: {
              labels: {
                render: 'value',
                fontColor: ['#fff','#fff','#fff','#fff','#fff','#777'],
                fontSize: '13',
                fontFamily: 'Poppins, Helvetica, sans-serif', 
                precision: 0
              }
            },
            cutoutPercentage: 65,
            responsive: true,
            maintainAspectRatio: false,
            legend: {
                display: false,
                position: 'top',
            },
            title: {
                display: false,
                text: 'Technology'
            },
            animation: {
                animateScale: true,
                animateRotate: true
            },
            tooltips: {
                enabled: true,
                intersect: false,
                mode: 'nearest',
                bodySpacing: 1,
                yPadding: 10,
                xPadding: 10, 
                caretPadding: 0,
                displayColors: false,                
                backgroundColor: '#ffffff',
                titleFontColor: '#777',
                bodyFontColor: '#999', 
                borderWidth: 0.5,
                borderColor: '#aaa',
                cornerRadius: 4,
                footerSpacing: 0,
                titleSpacing: 0
            }
        }
    };

    var ctx = document.getElementById('kt_widget_technologies_chart').getContext('2d');
    AppCharts.defectStatus.chart = new Chart(ctx, config);
}


var sevChart = function() {
        if (!document.getElementById('kt_chart_sales_statistics')) {
            return;
        }

        var color = Chart.helpers.color;
        var barChartData = {
            labels: ['Severity'],
            datasets: [{
                label: 'Critical',
                backgroundColor: KTApp.getStateColor('danger'),
                borderWidth: 0,
                data: [sevDefects["Level 1 - Critical"]]
            },
            {
                label: 'Major',
                backgroundColor: color(KTApp.getStateColor('warning')).alpha(0.7).rgbString(),
                borderWidth: 0,
                data: [sevDefects["Level 2 - Major"]]
            },
            {
                label: 'Minor',
                backgroundColor: KTApp.getStateColor('success'),
                borderWidth: 0,
                data: [sevDefects["Level 3 - Minor"]]
            },
            {
                label: 'Cosmetic',
                backgroundColor: color(KTApp.getStateColor('fixed')).alpha(0.6).rgbString(),
                borderWidth: 0,
                data: [sevDefects["Level 4 - Cosmetic"]]
            }]
        };

        var ctx = document.getElementById('kt_chart_sales_statistics').getContext('2d');
        AppCharts.defectSeverity.chart = new Chart(ctx, {
            type: 'horizontalBar',
            data: barChartData,
            options: {
                responsive: true,
                cornerRadius: 25, 
                fullCornerRadius: true, 
                maintainAspectRatio: false,
                legend: false,
                scales: {
                    xAxes: [{
                        categoryPercentage: 0.35,
                        barPercentage: 0.7,
                        display: false,
                        scaleLabel: {
                            display: false,
                            labelString: 'Severity'
                        },
                        gridLines: false,
                        ticks: {
                            display: false,
                            beginAtZero: true,
                            fontColor: KTApp.getBaseColor('shape', 3),
                            fontSize: 13,
                            padding: 10,
                            reverse: true
                        }
                    }],
                    yAxes: [{
                        categoryPercentage: 1,
                        barPercentage: 0.40,
                        display: true,
                        scaleLabel: {
                            display: false,
                            labelString: 'Severity'
                        },
                        gridLines: {
                            display:false,
                            color: KTApp.getBaseColor('shape', 2),
                            drawBorder: false,
                            offsetGridLines: false,
                            drawTicks: false,
                            zeroLineWidth: 1,
                            zeroLineColor: KTApp.getBaseColor('shape', 2)
                        },
                        ticks: {
                            max: 70,                            
                            stepSize: 10,
                            display: false,
                            beginAtZero: true,
                            fontColor: KTApp.getBaseColor('shape', 3),
                            fontSize: 13,
                            padding: 10
                        }
                    }]
                },
                title: {
                    display: false
                },
                hover: {
                    mode: 'index'
                },
                tooltips: {
                    enabled: true,
                    intersect: false,
                    mode: 'nearest',
                    bodySpacing: 5,
                    yPadding: 10,
                    xPadding: 10, 
                    caretPadding: 0,
                    displayColors: false,
                    backgroundColor: '#ffffff',
                    titleFontColor: '#777',
                    bodyFontColor: '#999', 
                    borderWidth: 0.5,
                    borderColor: '#aaa',
                    cornerRadius: 4,
                    footerSpacing: 0,
                    titleSpacing: 0
                },
                layout: {
                    padding: {
                        left: 0,
                        right: 0,
                        top: 5,
                        bottom: 5
                    }
                }
            }
        });
    }


var AppCharts = {
    defectStatus: {
        chart:     null,
        id:        '#kt_widget_technologies_chart',
        target:    '#helix_status_chart',
        container: '<canvas id="kt_widget_technologies_chart" class="chartjs-render-monitor" style="z-index: 50"></canvas>', 
    },
    defectProgress: {
        chart:     null,
        chartType: 'line',
        chartData: null,
        id:        '#kt_chart_revenue_growth',
        target:    '#helix_progress_chart',
        container: '<canvas id="kt_chart_revenue_growth" height="250" style="display: block; width: 969px; height: 250px;" width="969" class="chartjs-render-monitor"></canvas>', 
    },
    defectSeverity: {
        chart:     null,
        id:        '#kt_chart_sales_statistics',
        target:    '#helix_sev_chart',
        container: '<canvas id="kt_chart_sales_statistics" class="chartjs-render-monitor"></canvas>', 
    }
};

var histOpen   = [];
var histFixed  = [];
var histClosed = [];
var histLabels = [];

var histOpenArr   = [];
var histFixedArr  = [];
var histClosedArr = [];
var histLabelsArr = [];

var defectsStatusData = [];
var sevDefects;
// Class initialization

function handleResize() {
    $.each(AppCharts, function(chart) {
        var current = AppCharts[chart];
        $(current.id).remove();
        $(current.target).after(current.container);
        if (current.chart != undefined) {
          current.chart.draw();
        }           
    });
    defectStatusPie();
    sevChart();
    KTDashboard.init();
    destroyChart('defectProgress');
    widgetRevenueGrowthChart();
}

var allDefects;
var historicalData;
var defectsFS;

function getAllDefects() {
    
    $.ajax({
        type: "GET",
        async: true,
        dataType: "json",
        url: "http://localhost:"+port+"/getAllDefects",
        success: function(data){
            //console.log("Success", data);
            allDefects = data;
        },
        fail: function(data){
            console.log("Error", data);
        }
    });
} 

function getAllDefectsInfo() {
    $('#loading_data').show();
    $.ajax({
        type: "GET",
        async: true,
        dataType: "json",
        url: "http://localhost:"+port+"/getAllDefectInformation",
        success: function(data){
            //console.log("Success", data);
            allDefectsInfo = addTeam(data);    
            console.log(allDefectsInfo);
        },
        fail: function(data){
            console.log("Error", data);
        },
        complete: function() {    
          $('#loading_data').hide();      
            allDefectsTable();  
        }
    });
} 

function hideCharts() {
  $('#helix_status_chart_total').html('<div class="spinner-grow text-info" role="status"><span class="sr-only">Loading...</span></div>');
  $('#progress_loading').show();
  destroyChart('defectStatus');
  destroyChart('defectSeverity');
  destroyChart('defectProgress');
  $('#sev1').html("");
  $('#sev2').html("");
  $('#sev3').html("");
  $('#sev4').html("");
  defectTeams.forEach(function(team, i) {
    var teamIdx = "team_"+team;
    $('#'+teamIdx+'_open').html("-").closest('li').css('opacity','1.0');              
    $('#'+teamIdx+'_total').html("-");
  });
}

function destroyChart(chartName) {
  $.each(AppCharts, function(chart) {
      var current = AppCharts[chart];
      if(chart == chartName) {
        if (AppCharts[chart].chart != undefined) {
          console.log("Destroying " + chartName);
          AppCharts[chart].chart.destroy();
        }
      }      
  });
}

function getDefectInfo(functional_set) {
    //console.log('before call');
    var serviceUrl = "http://localhost:"+port+"/getAllDefects/"; 
    if (functional_set != undefined) {
      serviceUrl = "http://localhost:"+port+"/getAllDefects/fsName/"+functional_set;
    }

    hideCharts();

    if (true) {
       $.ajax({
          type: "GET",
          async: true,
          cache: true,
          dataType: "json",
          url: serviceUrl,
          success: function(data){
              //console.log("Success. Data:", JSON.stringify(data));
              defectsFS = data;
              renderDefectStatusData(functional_set);
          },
          fail: function(data){
              defectsFS = DefectStatus[functional_set];
              renderDefectStatusData(functional_set);
              //console.log("Error", data);
          }
      });
    } else {
      defectsFS = DefectStatus[functional_set];
      renderDefectStatusData(functional_set);
    }

    
} 

function renderDefectStatusData(functional_set) {
  if(defectsFS.issues != undefined) {
    var defectTotals  = getDefectStatusInfo(defectsFS.issues);
    defectsFS         = addTeam(defectsFS);
    var teamTotals = [];
    defectsFS.issues.forEach(function (o, i) {    
      if (o.ASSIGNED != undefined) {
          if(teamTotals[o.TEAM] == undefined) {
            teamTotals[o.TEAM] = { open: 0, total: 0};
          }
          teamTotals[o.TEAM].total += 1;
          if (openStatus.indexOf(o.STATUS) >= 0) {
            if (o.STATUS == 'Failed') {
              defectsFS.issues[i].STATUS = 'Reopen';
            }
            if (o.STATUS == 'Open/New') {
              defectsFS.issues[i].STATUS = 'Open';
            }
            teamTotals[o.TEAM].open += 1;
          }
      }              
    });
    
    defectTeams.forEach(function(team, i) {
      var teamIdx = "team_"+team;
      if (teamTotals[teamIdx] != undefined) {
        $('#'+teamIdx+'_open').html(teamTotals[teamIdx].open);
        if (teamTotals[teamIdx].open == 0) {
          $('#'+teamIdx+'_open').closest('li').css('opacity','0.5')
        }              
        $('#'+teamIdx+'_total').html(teamTotals[teamIdx].total);

      } else {
        $('#'+teamIdx+'_open').html("0").closest('li').css('opacity','0.5');              
        $('#'+teamIdx+'_total').html("0");
      }
    });

    defectsStatusData = defectTotals.status;
    sevDefects        = defectTotals.severity;

    
    if(NVL(functional_set,"").includes("Provider Partners")) {
      setupHistData(functional_set);
      setupTestExecutionData("Provider Partners (Part A)");
    }
    else if(NVL(functional_set,"").includes("Suspend & Unsuspend client")) {
      setupHistData("Suspend & Unsuspend client/customer");
      setupTestExecutionData("Suspend & Unsuspend client/customer");
    } else {
      setupHistData(functional_set);
      setupTestExecutionData(functional_set);
    }

    defectStatusPie();
    sevChart();
    if (defectsFS.issues.length > 0) {
      $('#sev1').html(Math.round(NVL(sevDefects["Level 1 - Critical"],0)/defectsFS.issues.length*100)+"%");
      $('#sev2').html(Math.round(NVL(sevDefects["Level 2 - Major"],0)/defectsFS.issues.length*100)+"%");
      $('#sev3').html(Math.round(NVL(sevDefects["Level 3 - Minor"],0)/defectsFS.issues.length*100)+"%");
      $('#sev4').html(Math.round(NVL(sevDefects["Level 4 - Cosmetic"],0)/defectsFS.issues.length*100)+"%");
    } else {
      $('#sev1').html("0%");
      $('#sev2').html("0%");
      $('#sev3').html("0%");
      $('#sev4').html("0%");
    }            

    $('#helix_status_chart_total').html(NVL(defectsFS.issues.length,0));
  } else {
    $('#sev1').html("0%");
    $('#sev2').html("0%");
    $('#sev3').html("0%");
    $('#sev4').html("0%");              
    $('#helix_status_chart_total').html(0);
  }  
}

function setupTestExecutionData(functional_set) {

  $('#te_passed').html('0');
  $('#te_failed').html('0');
  $('#te_notexe').html('0');
  $('#te_passrate').html('0 %');
  if (TestExecution[functional_set] != undefined) {
    $('#te_passed').html(TestExecution[functional_set].Passed);
    $('#te_failed').html(TestExecution[functional_set].Failed);
    $('#te_notexe').html(TestExecution[functional_set].Progress+TestExecution[functional_set].NotStarted+TestExecution[functional_set].Blocked);
    var passed_perc = Math.round(TestExecution[functional_set].Passed/TestExecution[functional_set].Total*100);
    var failed_perc = Math.round(TestExecution[functional_set].Failed/TestExecution[functional_set].Total*100);
    var notexe_perc = 1-(passed_perc+failed_perc);
    $('#te_passrate').html(passed_perc+" %");
    $('.te_execution .passed').css('width', passed_perc+'%');
    $('.te_execution .failed').css('width', failed_perc+'%');
    $('.te_execution .notexe').css('width', notexe_perc+'%');
  } else {
    $('.te_execution .passed').css('width', '0%');
    $('.te_execution .failed').css('width', '0%');
    $('.te_execution .notexe').css('width', '100%');
  }
}

function setupHistData(functional_set) {
  var index = 0;
  histOpenArr   = [];
  histFixedArr  = [];
  histClosedArr = [];
  histLabelsArr = [];
  HistData.forEach(function (day_issues) {
    index += 1;
    var issues = day_issues.issues;    
    var arrayDefects = [];
    issues.forEach(function(o, idx) {
      if (functional_set != undefined) {
        if(o.FS != undefined) {
          if(o.FS[0].value == functional_set) {
            arrayDefects.push(o);
          }
        }
      } else {
        arrayDefects.push(o);
      }      
    });
    var defectTotals  = getDefectStatusInfo(arrayDefects);
    histOpenArr.push(defectTotals.open+defectTotals.review);
    histFixedArr.push(defectTotals.fixed+defectTotals.testing);
    histClosedArr.push(defectTotals.closed+defectTotals.not_a_bug);
    histLabelsArr.push(day_issues.DATE.substr(5,5).replace("-","/"));
  });
  showProgressChart($('.defect-progress-days.btn-primary').attr('data-days'));
}

function showProgressChart(days) {
  histOpen   = histOpenArr.concat();
  histFixed  = histFixedArr.concat();
  histClosed = histClosedArr.concat();
  histLabels = histLabelsArr.concat();

  histOpen   = histOpen.splice(0,days);
  histFixed  = histFixed.splice(0,days);
  histClosed = histClosed.splice(0,days);
  histLabels = histLabels.splice(0,days);

  histOpen   = histOpen.reverse();
  histFixed  = histFixed.reverse();
  histClosed = histClosed.reverse();
  histLabels = histLabels.reverse();

  destroyChart('defectProgress');
  widgetRevenueGrowthChart();

  $('.defect-progress-days').removeClass('btn-primary');
  $('.defect-progress-days').removeClass('btn-default');
  $('.defect-progress-days').addClass('btn-default');
  $('.defect-progress-days[data-days="'+days+'"]').removeClass('btn-default').addClass('btn-primary');
}

function addTeam(defectList) {
  defectList.issues.forEach(function (o, i) {    
    if (o.ASSIGNED != undefined) {
        var team = teamMapping[o.ASSIGNED.replace(/ *\([^)]*\) */g, "")];
        defectList.issues[i].TEAM = "team_"+team;  
    }              
  });
  return defectList;
}

function getDefectStatusInfo(defectList) {
  var counts = {};
  var sev = {};
  defectList.forEach(function (o) {
    var status = o.STATUS;
    if (o.STATUS == "Open/New") {
      status = "Open";
    }

      if (!counts.hasOwnProperty(status)) {
          counts[status] = 0;
      }
      if (!sev.hasOwnProperty(o.SEVERITY)) {
          sev[o.SEVERITY] = 0;
      }
      counts[status] += 1;
      sev[o.SEVERITY] += 1;
  });

  var d = {
    open:       NVL(counts["Open"],         0) + NVL(counts["Open/New"],         0) +
                NVL(counts["Fixing"],       0) + 
                NVL(counts["Reopen"],       0) + 
                NVL(counts["Failed"],       0) + 
                NVL(counts["Blocked"],      0) + 
                NVL(counts["Triage"],       0),
    fixed:      NVL(counts["Fixed"],        0),
    testing:    NVL(counts["Ready to Test"],0) + NVL(counts["Ready For Test"],0) + 
                NVL(counts["Testing IP"],   0),
    review:     NVL(counts["Reviewing"],    0),
    closed:     NVL(counts["Closed"],       0) +
                NVL(counts["Deferred"],     0),
    not_a_bug:  NVL(counts["Not a Bug"],    0) +
                NVL(counts["Rejected"],     0)
  };

  var defectTotals = {
    open: d.open, fixed: d.fixed, testing: d.testing, review: d.review, closed: d.closed, not_a_bug: d.not_a_bug,
    status:   [d.open, d.fixed, d.testing, d.review, d.closed, d.not_a_bug],
    severity: sev
  }
  return defectTotals;
}

function NVL(value1,value2)  {
  if (value1 == undefined)
    return value2;
  return value1;
}

function setUpDefectData(fsName) {
  getDefectInfo(fsName);
}

var HistData;
var total = 0;
var HistDataChecked = false;

function getHistoricalData() {

  $.ajax({
      url: "http://localhost:3000/getHistoricalData",
      async: false,
      success: function (result) {
          HistData = result;
          HistDataChecked = true;
      },
      error: function (err) {
          console.log("Historical Data Error");
          HistDataChecked = true;
          HistData = [];
      }
  });
}


var KTQuickSearch = function() {
    var target;
    var form;
    var input;
    var closeIcon;
    var resultWrapper;
    var resultDropdown;
    var resultDropdownToggle;
    var inputGroup;
    var query = '';

    var hasResult = false; 
    var timeout = false; 
    var isProcessing = false;
    var requestTimeout = 200; // ajax request fire timeout in milliseconds 
    var spinnerClass = 'kt-spinner kt-spinner--input kt-spinner--sm kt-spinner--brand kt-spinner--right';
    var resultClass = 'kt-quick-search--has-result';
    var minLength = 2;

    var showProgress = function() {
        isProcessing = true;
        KTUtil.addClass(inputGroup, spinnerClass); 

        if (closeIcon) {
            KTUtil.hide(closeIcon);
        }       
    }

    var hideProgress = function() {
        isProcessing = false;
        KTUtil.removeClass(inputGroup, spinnerClass);

        if (closeIcon) {
            if (input.value.length < minLength) {
                KTUtil.hide(closeIcon);
            } else {
                KTUtil.show(closeIcon, 'flex');
            }            
        }
    }

    var showDropdown = function() {
        if (resultDropdownToggle && !KTUtil.hasClass(resultDropdown, 'show')) {
            $(resultDropdownToggle).dropdown('toggle');
            $(resultDropdownToggle).dropdown('update'); 
        }
    }

    var hideDropdown = function() {
        if (resultDropdownToggle && KTUtil.hasClass(resultDropdown, 'show')) {
            $(resultDropdownToggle).dropdown('toggle');
        }
    }

    var processSearch = function() {
        if (hasResult && query === input.value) {  
            hideProgress();
            KTUtil.addClass(target, resultClass);
            showDropdown();
            KTUtil.scrollUpdate(resultWrapper);

            return;
        }

        query = input.value;

        KTUtil.removeClass(target, resultClass);
        showProgress();
        hideDropdown();
        
        /*setTimeout(function() {
            $.ajax({
                url: 'https://keenthemes.com/keen/tools/preview/inc/api/quick_search.php',
                data: {
                    query: query
                },
                dataType: 'html',
                success: function(res) {
                    hasResult = true;
                    console.log(res);
                    hideProgress();
                    KTUtil.addClass(target, resultClass);
                    KTUtil.setHTML(resultWrapper, res);
                    showDropdown();
                    KTUtil.scrollUpdate(resultWrapper);
                },
                error: function(res) {
                    hasResult = false;
                    hideProgress();
                    KTUtil.addClass(target, resultClass);
                    KTUtil.setHTML(resultWrapper, '<span class="kt-quick-search__message">Connection error. Pleae try again later.</div>');
                    showDropdown();
                    KTUtil.scrollUpdate(resultWrapper);
                }
            });
        }, 1000);  
        */
        //
        setTimeout(function() {
          var fsArr = [];
          var peopleArr = [];
          var fsNames = Object.keys(FunctionalSet);
          fsNames.forEach(function (fs_str) {
            if (fs_str.includes(query)) {
              fsArr.push({name: fs_str, domain: FunctionalSet[fs_str], initials: getNameInitials(FunctionalSet[fs_str])});
            }
          });
          var teamNames = Object.keys(teamMapping);
          teamNames.forEach(function (name_str) {
            if (name_str.includes(query)) {
              peopleArr.push({name: name_str, team: teamMapping[name_str], initials: getNameInitials(name_str)});
            }
          });
          if (fsArr.length>0 || peopleArr.length>0) {
            hasResult = true;
          }

          // -- start HTML
          var html = "";
          var peopleHtml = "";
          var fsHtml = "";
          fsArr.forEach(function(f) {
            var temp = "";
            temp += fsDiv.replace("$functional_set",f.name)
                         .replace("$domain",f.domain)
                         .replace("$avatar","https://i0.wp.com/avatar-management--avatars.us-west-2.prod.public.atl-paas.net/initials/"+f.initials+"-"+getColor(f.initials)+".png?ssl=1");
            fsHtml += temp;
          });
          if (fsArr.length == 0) {
            fsHtml = fsDiv.replace("$functional_set","No records found").replace("$domain","").replace("$avatar","");
          }
          peopleArr.forEach(function(p) {
            var temp = "";
            temp += peopleDiv.replace("$name",p.name)
                             .replace("$team",p.team)
                             .replace("$avatar","https://i0.wp.com/avatar-management--avatars.us-west-2.prod.public.atl-paas.net/initials/"+p.initials+"-"+(Math.round(Math.random()*5)+1)+".png?ssl=1");
            peopleHtml += temp;
          });
          if (peopleArr.length == 0) {
            peopleHtml = fsDiv.replace("$functional_set","No records found").replace("$domain","").replace("$avatar","");
          }
          html += searchDiv.replace("$fs_array",fsHtml).replace("$people_array",peopleHtml);
          // -- end HTML

          hideProgress();
          KTUtil.addClass(target, resultClass);
          KTUtil.setHTML(resultWrapper, html);
          showDropdown();
          KTUtil.scrollUpdate(resultWrapper);

          $('.kt-quick-search__item').click(function(e) {        
            var fs = $($(e.target).closest('.kt-quick-search__item')).find('a.fs_name').text();
            if (fs != undefined && fs != "") {
              loadPage($('[page-title="'+fs+'"]'));              
            }
            var fn = $($(e.target).closest('.kt-quick-search__item')).find('a.pn_name').text();
            if (fn != undefined && fn != "") {
              $('#generalSearch').val(fn);
              loadPage($('[container-target="defect_list"]'));           
            }
          });

                
        }, 500);      
    }

    var handleCancel = function(e) {
        input.value = '';
        query = '';
        hasResult = false;
        KTUtil.hide(closeIcon);
        KTUtil.removeClass(target, resultClass);
        hideDropdown();
    }

    var handleSearch = function() {
        if (input.value.length < minLength) {
            hideProgress();
            hideDropdown();

            return;
        }

        if (isProcessing == true) {
            return;
        }

        if (timeout) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(function() {
            processSearch();
        }, requestTimeout);     
    }

    return {     
        init: function(element) { 
            // Init
            target = element;
            form = KTUtil.find(target, '.kt-quick-search__form');
            input = KTUtil.find(target, '.kt-quick-search__input');
            closeIcon = KTUtil.find(target, '.kt-quick-search__close');
            resultWrapper = KTUtil.find(target, '.kt-quick-search__wrapper');
            resultDropdown = KTUtil.find(target, '.dropdown-menu'); 
            resultDropdownToggle = KTUtil.find(target, '[data-toggle="dropdown"]');
            inputGroup = KTUtil.find(target, '.input-group');           

            // Attach input keyup handler
            KTUtil.addEvent(input, 'keyup', handleSearch);
            KTUtil.addEvent(input, 'focus', handleSearch);

            // Prevent enter click
            form.onkeypress = function(e) {
                var key = e.charCode || e.keyCode || 0;     
                if (key == 13) {
                    e.preventDefault();
                }
            }
           
            KTUtil.addEvent(closeIcon, 'click', handleCancel);     
        }
    };
};

function getColor(fi) {
  switch(fi) {
    case "CS":
      return '1' 
      break;
    case "PB":
      return '2'
      break;
    case "C":
      return '3'
      break;
    case "CD":
      return '4'
      break;
    case "P":
      return '5'
      break;      
    case "EE":
      return '6'
      break;
    default:
      return '1';
  } 
}

var KTQuickSearchMobile = KTQuickSearch;

// Init on page load completed
KTUtil.ready(function() {
    
});

var round = 0;

jQuery(document).ready(function() {
    
    getHistoricalData();

    KTDashboard.init();

    loadPage($('[page-title="Broker Maintenance"]'), true); 

    if (KTUtil.get('kt_quick_search_dropdown')) {
        KTQuickSearch().init(KTUtil.get('kt_quick_search_dropdown'));
    }

    if (KTUtil.get('kt_quick_search_inline')) {
        KTQuickSearchMobile().init(KTUtil.get('kt_quick_search_inline'));
    }

    if (KTUtil.get('kt_quick_search_offcanvas')) {
        KTQuickSearchMobile().init(KTUtil.get('kt_quick_search_offcanvas'));
    }

    getAllDefectsInfo();

    $('.defect-progress-days[data-days]').bind('click', function(e) {
      var days = $(e.target).attr('data-days');
      showProgressChart(days);
    });

    $(window).resize(function(){
        handleResize();        
    });
    $('#kt_aside_toggler').click(function() {
        handleResize();
    });
    
    $('.options_change_chart').bind('click', function(e) {
        var chartType = $(e.target).closest('li').attr('data-chart-type');
        AppCharts.defectProgress.changeType(chartType);
    });

    $('.changeChartType').bind('click', function(e) {
        var chartType = $(e.target).attr('data-chart-type');
        if(chartType == 'line') {
            $(e.target).attr('data-chart-type','bar');
            $(e.target).html('Line');
        } else {
            $(e.target).attr('data-chart-type','line');
            $(e.target).html('Bar');
        }
        AppCharts.defectProgress.changeType(chartType);
    });

    AppCharts.defectProgress.changeType = function(chartType) {
        AppCharts.defectProgress.chartType = chartType;
        AppCharts.defectProgress.chart.destroy();
        widgetRevenueGrowthChart();       
    }

    $('.kt-menu__item').click(function(e) {
      var target = $(e.target).closest('li');      
      loadPage(target);
    });

    statusTable();

    setInterval(function() {
      //$('[page-title]')[round].click();
      round = round+1;
      if (round >= $('[page-title]').length) {
        round = 0;
      }
    }, 25000);

});

function loadPage(target, bypass) {

  var container = target.attr('container-target');
  if (container != undefined) {

    if (container == "defect_list") {
      //$('#kt_form_sev,#kt_form_status,#kt_form_team').selectpicker();   
      //allDefectsTable();  
      //$('#kt_form_team')   .val("") .change();
      //$('#kt_form_status') .val("") .change();
      //$('#kt_form_sev')    .val("") .change();
      datatable.reload();
    }

    if (container == "functional_set_info") {
      statusTableVar.reload();
    }


    var page_title = target.attr('page-title');
    $('.main_container').hide();
    $('.kt-menu__item--active').removeClass('kt-menu__item--active');

    $('#title_page').html(page_title);
    $('#domain_pill').html('<span class="badge badge-pill '+NVL(fsPill[FunctionalSet[page_title]],'badge-secondary')+'">' + NVL(FunctionalSet[page_title],'Overview') + '</span>');

    $('#'+container).show();
    target.addClass('kt-menu__item--active');

    if(!bypass) {
      handleResize();
    }

    if (container == "defect_overview") {
      var fsNameAttr = target.attr('data-fs');
      if (fsNameAttr.length > 0) {
        setUpDefectData(fsNameAttr);
      } else {
        setUpDefectData();
      }          
    }
  }      
}