
async function getAllIssues(){
  console.log("teste");
  const response = await fetch(`/issues`);
  response_d = await response.json();
  console.log(response_d);
  document.getElementById('totalCount').textContent = response_d.total;
};

function float2dollar(value){
  return "U$ "+(value).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}



function renderChart(data, labels) {
  var ctx = document.getElementById("myChart").getContext('2d');
  var myChart = new Chart(ctx, {
      type: 'line',
      data: {
          labels: labels,
          datasets: [{
              label: 'Issues',
              data: data,
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
          }]
      },
      options: {            
          scales: {
              yAxes: [{
                  ticks: {
                      beginAtZero: true
                  }
              }]                
          }
      },
  });
}

function getChartData() {
  $("#loadingMessage").html('<img src="./giphy.gif" alt="" srcset="">');
  $.ajax({
      url: "http://localhost:3000/getHistoricalData",
      success: function (result) {
          $("#loadingMessage").html("");
          var data = [];
          var labels = [];
          result.forEach(element => {
            data.push(element.number_of_issues);
            labels.push(element.timestamp);
          });
          console.log(result);
          /*data.push(result.thisWeek);
          data.push(result.lastWeek);
          var labels = result.labels;*/
          renderChart(data, labels);
      },
      error: function (err) {
          $("#loadingMessage").html("Error");
      }
  });
}

$("#renderBtn").click(
  function () {
      getChartData();
  }
);



// schedule the first invocation:
setInterval(() => {
    console.log("Benfica 10");
    $.ajax({
      url: "http://localhost:3000/getAllDefects/FSD-2",
      success: function (result) {
    
          console.log(result);
         
      }
    });
  }, 5000);