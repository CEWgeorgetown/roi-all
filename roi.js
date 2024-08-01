Highcharts.setOptions({
  lang: {
    thousandsSep: ","
  }
})

const DEGCERT = "Certificate";
const DEGAA = "Associate's";
const DEGBA = "Bachelor's";
const CONTROL = ["Public", "Private nonprofit", "Private for-profit"]; // this has to match the x-axis in the drawchart function
const YEARS = ["2009-10", "2011-12", "2012-13", "2013-14", "2014-15", "2018-19", "2019-20", "2020-21", "2021-22"];
const HORIZONS = [10, 15, 20, 30, 40];
const DECILES = ["Top 10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "Bottom 10%"];

function displayModal(d, modalTitle) {

  $(".modal-title").empty();
  $(".modal-title").append(modalTitle);

  $("#table-inst").DataTable({
    initComplete: function () {
      $('#table-inst thead select').remove();
      this.api()
        .columns([1])
        .every(function () {
          let column = this;

          // Create select element
          let select = document.createElement('select');
          // select.add(new Option(''));
          let opt = document.createElement("option");
          opt.value = "";
          opt.innerHTML = "All";
          select.appendChild(opt);
          column.header().append(select);

          // Apply listener for user change in value
          select.addEventListener('change', function () {
            column
              .search(select.value, { exact: true })
              .draw();
          });
          select.addEventListener('click', function (e) {
            e.stopPropagation();
          });

          // Add list of options
          column
            .data()
            .unique()
            .sort()
            .each(function (d, j) {
              select.add(new Option(d));
            });
        });
    },
    responsive: true,
    pageLength: 10,
    deferRender: true,
    processing: true,
    destroy: true,
    order: [[0, "asc"], [1, "asc"]],
    data: d,
    columns: [
      { data: "nm" },
      { data: "st" },
      // { data: "c" },
      // { data: "pd" },
      // { data: "y" },
      {
        data: "npv",
        render: $.fn.dataTable.render.number(",", ",", 0, "$")
      }
    ]
  });
}

function displayTable() {

  $("#tbl-all").DataTable({
    initComplete: function () {
      $('#tbl-all thead select').remove();
      this.api()
        .columns([1, 2, 3, 4])
        .every(function () {
          let column = this;

          // Create select element
          let select = document.createElement('select');
          // select.add(new Option(''));
          let opt = document.createElement("option");
          opt.value = "";
          opt.innerHTML = "All";
          select.appendChild(opt);
          column.header().append(select);

          // Apply listener for user change in value
          select.addEventListener('change', function () {
            column
              .search(select.value, { exact: true })
              .draw();
          });
          select.addEventListener('click', function (e) {
            e.stopPropagation();
          });

          // Add list of options
          column
            .data()
            .unique()
            .sort()
            .each(function (d, j) {
              select.add(new Option(d));
            });
        });
    },
    columnDefs: [{ width: 400, targets: 0 }],
    responsive: true,
    pageLength: 10,
    deferRender: true,
    processing: true,
    destroy: true,
    order: [[0, "asc"], [1, "asc"]],
    data: roiall,
    columns: [
      { data: "nm" },
      { data: "st" },
      { data: "c" },
      { data: "pd" },
      { data: "y" },
      {
        data: "npv10",
        render: $.fn.dataTable.render.number(",", ",", 0, "$")
      },
      {
        data: "npv15",
        render: $.fn.dataTable.render.number(",", ",", 0, "$")
      },
      {
        data: "npv20",
        render: $.fn.dataTable.render.number(",", ",", 0, "$")
      },
      {
        data: "npv30",
        render: $.fn.dataTable.render.number(",", ",", 0, "$")
      },
      {
        data: "npv40",
        render: $.fn.dataTable.render.number(",", ",", 0, "$")
      }
    ]
  });
}

function drawChartDegreeHorizon(chtitle, sdata, currHorizon) {

  let ctitle = "";
  if (chtitle == DEGCERT) {
    ctitle = chtitle.toLowerCase() + "s";
  }
  else {
    ctitle = chtitle.toLowerCase() + " degrees"
  }

  Highcharts.chart("chart-degree-horizon", {
    chart: {
      type: "column",
      height: 500
    },
    title: {
      text: "Median " + currHorizon + "-year ROI for " + ctitle,
      align: "left"
    },
    xAxis: {
      categories: YEARS,
      accessibility: {
        description: "Year"
      }
    },
    yAxis: {
      min: 0,
      title: {
        text: "ROI (2023$)"
      },
      labels: {
        format: '$ {text}'
      }
    },
    legend: {
      enabled: true
    },
    credits: {
      enabled: true,
      text: "Georgetown Center on Education and the Workforce analysis of College Scorecard data, 2024",
      position: {
        align: "left",
        x: 10
      },
      style: {
        fontSize: "0.8rem"
      }
    },
    tooltip: {
      formatter: function () {
        return "<b>Year:</b> " + this.series.name + "<br>" +
          "<b>" + currHorizon + "-year ROI:</b> $" + Highcharts.numberFormat(this.y, 0, '.', ',') +
          "<br><i>Click for list of institutions</i>";
      }
    },
    plotOptions: {
      series: {
        groupPadding: 0.05,
        dataLabels: {
          enabled: true,
          style: {
            fontWeight: "normal",
            fontSize: "0.9rem"
          },
          formatter: function () {
            // return this.series.name + ": $" + Highcharts.numberFormat(this.y, 0, '.', ',');
            return "$" + Highcharts.numberFormat(this.y / 1000, 0, '.', ',') + "k";
          }
        },
        point: {
          events: {
            click: function (e) {
              // console.log(this);
              let c = this.series.name;
              let h = currHorizon;
              let d = chtitle;
              let yr = this.category;
              let modalData = roiall.filter(obj => obj.y == yr && obj.pd == d && obj.c == c);
              let mdata = [];
              if (h == 10) {
                mdata = modalData.map(({ y, nm, st, pd, c, npv10: npv, npv15, npv20, npv30, npv40 }) =>
                  ({ y, nm, st, pd, c, npv, npv15, npv20, npv30, npv40 }))
              } else if (h == 15) {
                mdata = modalData.map(({ y, nm, st, pd, c, npv10, npv15: npv, npv20, npv30, npv40 }) =>
                  ({ y, nm, st, pd, c, npv10, npv, npv20, npv30, npv40 }))
              } else if (h == 20) {
                mdata = modalData.map(({ y, nm, st, pd, c, npv10, npv15, npv20: npv, npv30, npv40 }) =>
                  ({ y, nm, st, pd, c, npv10, npv15, npv, npv30, npv40 }))
              } else if (h == 30) {
                mdata = modalData.map(({ y, nm, st, pd, c, npv10, npv15, npv20, npv30: npv, npv40 }) =>
                  ({ y, nm, st, pd, c, npv10, npv15, npv20, npv, npv40 }))
              } else if (h == 40) {
                mdata = modalData.map(({ y, nm, st, pd, c, npv10, npv15, npv20, npv30, npv40: npv }) =>
                  ({ y, nm, st, pd, c, npv10, npv15, npv20, npv30, npv }))
              };
              $("#modal-inst").modal('show');
              displayModal(mdata, "Median " + currHorizon + "-year ROI for " + ctitle + " for " + yr + ": " + c + " institutions");
            }
          }
        }
      }
    },
    series: sdata
  });

}

function getDataForChartDegreeHorizon(degree, horizon) {

  const chartColors = ["#144175", "#F9A21C", "#F1D117"];
  let degreehorizon = [];
  let subset = roisumm.filter(obj => obj.preddeg == degree && obj.horizon == horizon);
  CONTROL.forEach(function (citem, cindex) {
    let sdata = {
      name: citem,
      color: chartColors[cindex],
      data: []
    };
    let cdata = subset.filter(obj => obj.control == citem);
    YEARS.forEach(function (yitem, yindex) {
      let ydata = cdata.filter(obj => obj.year == yitem);
      // Returns an array with one item
      // TODO: There has to be a better way to do this instead of using the array reference [0]
      sdata.data.push(ydata[0].NPV)
    });
    degreehorizon.push(sdata);
  });
  return degreehorizon;
}

function getDataForChartYearControl(year, control) {

  const chartColors = ["#0074CC", "#266150", "#DE354C"];
  let yearcontrol = [];
  let subset = roisumm.filter(obj => obj.year == year && obj.control == control);
  [DEGCERT, DEGAA, DEGBA].forEach(function (ditem, dindex) {
    let sdata = {
      name: ditem,
      color: chartColors[dindex],
      data: []
    };
    let horizondata = subset.filter(obj => obj.preddeg == ditem);
    HORIZONS.forEach(function (hitem, hindex) {
      let ddata = horizondata.filter(obj => obj.horizon == hitem);
      // Returns an array with one item
      // TODO: There has to be a better way to do this instead of using the array reference [0]
      sdata.data.push(ddata[0].NPV)
    });
    yearcontrol.push(sdata);
  });
  return yearcontrol;
}

function drawChartYearControl(chtitle, sdata, year) {

  Highcharts.chart("chart-year-control", {
    chart: {
      type: "column",
      height: 500
    },
    title: {
      text: "Median ROI for " + chtitle.toLowerCase() + " institutions in " + year,
      align: "left"
    },
    xAxis: {
      categories: HORIZONS,
      title: {
        text: "Horizon"
      },
      labels: {
        format: '{value} years'
      },
      accessibility: {
        description: "Horizon for ROI"
      }
    },
    yAxis: {
      min: 0,
      title: {
        text: "ROI (2023$)"
      },
      labels: {
        format: '$ {text}' // '$ {value}'
      }
    },
    legend: {
      enabled: true
    },
    credits: {
      text: "Georgetown Center on Education and the Workforce analysis of College Scorecard data, 2024",
      position: {
        align: "left",
        x: 10
      },
      style: {
        fontSize: "0.8rem"
      }
    },
    tooltip: {
      formatter: function () {
        return "<b>Degree:</b> " + this.series.name + "<br>" +
          "<b>" + year + " ROI:</b> $" + Highcharts.numberFormat(this.y, 0, '.', ',') +
          "<br><i>Click for list of institutions</i>";
      }
    },
    plotOptions: {
      series: {
        groupPadding: 0.2,
        dataLabels: {
          enabled: true,
          style: {
            fontWeight: "normal",
            fontSize: "0.8rem"
          },
          formatter: function () {
            return "$" + Highcharts.numberFormat(this.y / 1000, 0, '.', ',') + "k";
          }
        },
        point: {
          events: {
            click: function (e) {
              // console.log(this);
              let d = this.series.name;
              let yr = year;
              let c = chtitle;
              let h = this.category;
              let modalData = roiall.filter(obj => obj.y == yr && obj.pd == d && obj.c == c);
              let mdata = [];
              if (h == 10) {
                mdata = modalData.map(({ y, nm, st, pd, c, npv10: npv, npv15, npv20, npv30, npv40 }) =>
                  ({ y, nm, st, pd, c, npv, npv15, npv20, npv30, npv40 }))
              } else if (h == 15) {
                mdata = modalData.map(({ y, nm, st, pd, c, npv10, npv15: npv, npv20, npv30, npv40 }) =>
                  ({ y, nm, st, pd, c, npv10, npv, npv20, npv30, npv40 }))
              } else if (h == 20) {
                mdata = modalData.map(({ y, nm, st, pd, c, npv10, npv15, npv20: npv, npv30, npv40 }) =>
                  ({ y, nm, st, pd, c, npv10, npv15, npv, npv30, npv40 }))
              } else if (h == 30) {
                mdata = modalData.map(({ y, nm, st, pd, c, npv10, npv15, npv20, npv30: npv, npv40 }) =>
                  ({ y, nm, st, pd, c, npv10, npv15, npv20, npv, npv40 }))
              } else if (h == 40) {
                mdata = modalData.map(({ y, nm, st, pd, c, npv10, npv15, npv20, npv30, npv40: npv }) =>
                  ({ y, nm, st, pd, c, npv10, npv15, npv20, npv30, npv }))
              };
              $("#modal-inst").modal('show');
              displayModal(mdata, "Median " + h + "-year ROI in " + yr + ": " + c + " institutions");
            }
          }
        }
      }
    },
    series: sdata
  });

}

function toggleTabs(showDegreeHorizon, showRanking, showAllData) {
  $("#tab-degree-horizon")[showDegreeHorizon ? "show" : "hide"]();
  $("#tab-rankings")[showRanking ? "show" : "hide"]();
  $("#tab-all-data")[showAllData ? "show" : "hide"]();

  $("#nav-degree-horizon").removeClass("activelink");
  $("#nav-rankings").removeClass("activelink");
  $("#nav-all").removeClass("activelink");

  if (showDegreeHorizon) $("#nav-degree-horizon").addClass("activelink");
  else if (showRanking) $("#nav-rankings").addClass("activelink");
  else if (showAllData) $("#nav-all").addClass("activelink");
}

function getDataForRankDecile(year, horizon) {

  const chartColors = ["#0074CC", "#266150", "#DE354C"];
  let rankDecile = [];
  let subset = ranksumm.filter(obj => obj.year == year && obj.horizon == horizon);
  [DEGCERT, DEGAA, DEGBA].forEach(function (ditem, dindex) {
    let sdata = {
      name: ditem,
      color: chartColors[dindex],
      data: []
    };
    let deciledata = subset.filter(obj => obj.preddeg == ditem);
    DECILES.forEach(function (ditem, dindex) {
      let ddata = deciledata.filter(obj => obj.decile == ditem);
      sdata.data.push({ y: ddata[0].share_d * 100, N: ddata[0].N_d, share_p: ddata[0].share_p * 100 });
    });
    rankDecile.push(sdata);
  });
  return rankDecile;
}

function getDataForRankDecileByDegree(data, degree) {
  let subset = data.filter(obj => obj.name == degree);
  let mdata = {
    name: degree,
    data: []
  };

  subset[0].data.forEach(function (item, index) {
    mdata.data.push({ y: item.share_p, N: item.N, share_d: item.y, color: "#B9D9EC" })
  })
  return [mdata];
}

function drawChartRankDecile(sdata, horizon, year) {

  Highcharts.chart("chart-rank-decile", {
    chart: {
      type: "column",
      height: 500
    },
    title: {
      text: "Likelihood of being in decile for " + horizon + "-year ROI: " + year,
      align: "left"
    },
    xAxis: {
      categories: DECILES,
      title: {
        text: "Decile"
      },
      accessibility: {
        description: "Decile for share of degrees"
      }
    },
    yAxis: {
      min: 0,
      max: 100,
      title: {
        text: "Share of degrees"
      },
      labels: {
        format: '{value} %'
      }
    },
    legend: {
      enabled: true
    },
    credits: {
      text: "Georgetown Center on Education and the Workforce analysis of College Scorecard data, 2024",
      position: {
        align: "left",
        x: 10
      },
      style: {
        fontSize: "0.8rem"
      }
    },
    tooltip: {
      formatter: function () {
        return "<b>Degree:</b> " + this.series.name + "<br>" +
          "<b>Decile:</b> " + this.x + "<br>" +
          "<b>Likelihood:</b> " + Highcharts.numberFormat(this.y, 0, '.', ',') + "% <br>" +
          "<b>Number of institutions:</b> " + this.point.N + "<br>" +
          "Click for more details";
      },
    },
    plotOptions: {
      column: {
        stacking: "normal"
      },
      series: {
        dataLabels: {
          enabled: true,
          formatter: function () {
            return Highcharts.numberFormat(this.y, 0, '.', ',') + "%"
          }
        },
        point: {
          events: {
            click: function (e) {
              // console.log(this);
              let d = this.series.name;
              let yr = year;
              let r = this.x + 1; // why is this zero based vs the tooltip which is 1 based?
              let h = horizon;
              let modalData = roiall.filter(obj => obj.y == yr && obj.pd == d && obj.dnpv10 == r);
              let mdata = [];
              if (h == 10) {
                mdata = modalData.filter(obj => obj.dnpv10 == r).map(({ y, nm, st, pd, c, npv10: npv, npv15, npv20, npv30, npv40 }) =>
                  ({ y, nm, st, pd, c, npv, npv15, npv20, npv30, npv40 }))
              } else if (h == 15) {
                mdata = modalData.filter(obj => obj.dnpv15 == r).map(({ y, nm, st, pd, c, npv10, npv15: npv, npv20, npv30, npv40 }) =>
                  ({ y, nm, st, pd, c, npv10, npv, npv20, npv30, npv40 }))
              } else if (h == 20) {
                mdata = modalData.filter(obj => obj.dnpv20 == r).map(({ y, nm, st, pd, c, npv10, npv15, npv20: npv, npv30, npv40 }) =>
                  ({ y, nm, st, pd, c, npv10, npv15, npv, npv30, npv40 }))
              } else if (h == 30) {
                mdata = modalData.filter(obj => obj.dnpv30 == r).map(({ y, nm, st, pd, c, npv10, npv15, npv20, npv30: npv, npv40 }) =>
                  ({ y, nm, st, pd, c, npv10, npv15, npv20, npv, npv40 }))
              } else if (h == 40) {
                mdata = modalData.filter(obj => obj.dnpv40 == r).map(({ y, nm, st, pd, c, npv10, npv15, npv20, npv30, npv40: npv }) =>
                  ({ y, nm, st, pd, c, npv10, npv15, npv20, npv30, npv }))
              };
              $("#modal-inst").modal('show');
              displayModal(mdata, "Median " + h + "-year ROI in " + yr);
            }
          }
        }

      }
    },
    series: sdata
  });
}

function drawChartRankDecileByDegree(sdata, horizon, year, degree) {

  Highcharts.chart("chart-rank-deg", {
    chart: {
      type: "lollipop",
      inverted: true,
      height: 500
    },
    title: {
      text: "Degree: " + degree,
      align: "left"
    },
    subtitle: {
      text: horizon + "-year ROI for " + year,
      align: "left"
    },
    xAxis: {
      categories: DECILES,
      title: {
        text: "Decile"
      },
      accessibility: {
        description: "Decile for share for this degree"
      }
    },
    yAxis: {
      min: 0,
      title: {
        text: "Share in decile"
      },
      labels: {
        enabled: false,
        format: '{value}%'
      }
    },
    legend: {
      enabled: false
    },
    credits: {
      enabled: true,
      text: "Georgetown Center on Education and the Workforce analysis of College Scorecard data, 2024",
      position: {
        align: "left",
        x: 10
      },
      style: {
        fontSize: "0.8rem"
      }
    },
    tooltip: {
      formatter: function () {
        return "<b>Degree:</b> " + this.series.name + "<br>" +
          "<b>Decile:</b> " + this.x + "<br>" +
          "<b>Likelihood:</b> " + Highcharts.numberFormat(this.y, 0, '.', ',') + "% <br>" +
          "<b>Number of institutions:</b> " + this.point.N;
      },
    },
    plotOptions: {
      series: {
        dataLabels: {
          enabled: true,
          formatter: function () {
            return Highcharts.numberFormat(this.y, 0, '.', ',') + "%"
          }
        },
        point: {
          events: {
            click: function (e) {
              console.log(this);
              // Event doesn't seem to trigger
            }
          }
        }
      }
    },
    series: sdata
  });
}

$(document).ready(function () {

  // set up table for ROI over years
  let currHorizon = 10;
  let currDeg = DEGCERT;
  let chartData = getDataForChartDegreeHorizon(currDeg, currHorizon);
  drawChartDegreeHorizon(currDeg, chartData, currHorizon);

  // set up table for ROI over horizon
  let currType = "Public";
  let currYear = "2021-22"
  let chartData2 = getDataForChartYearControl(currYear, currType);
  drawChartYearControl(currType, chartData2, currYear);

  // set up table for ROI ranking
  let currRankHorizon = 10;
  let currRankYear = "2021-22";
  let chartData3 = getDataForRankDecile(currRankYear, currRankHorizon);
  drawChartRankDecile(chartData3, currRankHorizon, currRankYear);

  let currRankDegree = DEGCERT;
  let chartData4 = getDataForRankDecileByDegree(chartData3, currRankDegree);
  drawChartRankDecileByDegree(chartData4, currRankHorizon, currRankYear, currRankDegree);

  // set up table
  displayTable();

  // set up page
  toggleTabs(true, false, false, false);

  // events for tabs
  $("#nav-degree-horizon").on("click", function () {
    toggleTabs(true, false, false);
  });
  $("#nav-rankings").on("click", function () {
    toggleTabs(false, true, false);
  });
  $("#nav-all").on("click", function () {
    toggleTabs(false, false, true)
  });

  // events for controls for ROI over years
  $("#select-degree").change(function () {
    if ($("#select-degree :selected").val() > 0) {
      currDeg = $("#select-degree :selected").text();
      chartData = getDataForChartDegreeHorizon(currDeg, currHorizon);
      drawChartDegreeHorizon(currDeg, chartData, currHorizon);
    }
  });

  $("input[name=radio-horizon]").click(function () {
    currHorizon = this.value;
    chartData = getDataForChartDegreeHorizon(currDeg, currHorizon);
    drawChartDegreeHorizon(currDeg, chartData, currHorizon);
  });

  $("#select-year").change(function () {
    if ($("#select-year :selected").val() > 0) {
      currYear = $("#select-year :selected").text();
      chartData2 = getDataForChartYearControl(currYear, currType);
      drawChartYearControl(currType, chartData2, currYear);
    }
  });

  // events for controls for ROI by horizon
  $("input[name=radio-type]").click(function () {
    currType = this.value;
    chartData2 = getDataForChartYearControl(currYear, currType);
    drawChartYearControl(currType, chartData2, currYear);
  });

  // events for controls for ROI ranking
  $("#select-year-rank").change(function () {
    if ($("#select-year-rank :selected").val() > 0) {
      currRankYear = $("#select-year-rank :selected").text();
      chartData3 = getDataForRankDecile(currRankYear, currRankHorizon);
      drawChartRankDecile(chartData3, currRankHorizon, currRankYear);
      chartData4 = getDataForRankDecileByDegree(chartData3, currRankDegree);
      drawChartRankDecileByDegree(chartData4, currRankHorizon, currRankYear, currRankDegree);
    }
  });

  $("input[name=radio-horizon-rank]").click(function () {
    currRankHorizon = this.value;
    chartData3 = getDataForRankDecile(currRankYear, currRankHorizon);
    drawChartRankDecile(chartData3, currRankHorizon, currRankYear);
    chartData4 = getDataForRankDecileByDegree(chartData3, currRankDegree);
    drawChartRankDecileByDegree(chartData4, currRankHorizon, currRankYear, currRankDegree);
  });

  $("#select-degree-rank").change(function () {
    if ($("#select-degree-rank :selected").val() > 0) {
      currRankDegree = $("#select-degree-rank :selected").text();
      chartData4 = getDataForRankDecileByDegree(chartData3, currRankDegree);
      drawChartRankDecileByDegree(chartData4, currRankHorizon, currRankYear, currRankDegree);
    }
  });

})
