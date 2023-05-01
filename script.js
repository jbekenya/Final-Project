async function mainEvent() { 
    const form = document.querySelector('.main_form'); 
    const loadJobData = document.querySelector("#load_job_data");
    const generateListButton = document.querySelector('#generate');
    const resetList = document.querySelector("#reset_data");
    const textField = document.querySelector('#job');
    const companyTextField = document.querySelector("#company");
    

    const mapList = initMap();

    const storedData = localStorage.getItem('storedData');
    let parsedData = JSON.parse(storedData);
    if (parsedData?.length > 0){
        generateListButton.classList.remove('hidden');
    }

    let jobList = [];
  
    loadJobData.addEventListener('click', async (submitEvent) => {

      const results = await fetch('https://901522ec-fa4d-4b63-aecc-a237dc24ac90.mock.pstmn.io/jobs/');
      let resultsBody = await results.text();
      resultsBody = resultsBody.replace(/[\u0000-\u001F]/g, '');
      parsedData =  JSON.parse(resultsBody);
      console.log(parsedData);

      if (parsedData?.length > 0){
        generateListButton.classList.remove('hidden');
      }

      drawChart(parsedData);
      
    });
  
    generateListButton.addEventListener('click', (event) => {
        jobList = cutList(parsedData);
        console.log('generate new list', jobList);
        injectHTML(jobList);
        markerPlace(jobList, mapList);

      })
    textField.addEventListener('input', (event)=>{
        console.log('input', event.target.value);
        const newList = filterList(jobList, event.target.value)
        console.log(newList);
        injectHTML(newList);
        markerPlace(newList, mapList);

    })

    companyTextField.addEventListener('input', (event)=>{
        console.log('input', event.target.value);
        const newList = filterList(jobList, event.target.value)
        console.log(newList);
        injectHTML(newList);
        markerPlace(newList, mapList);

    })

    resetList.addEventListener("click", (event) => {
        console.log('clear browser data');
        localStorage.clear();
        console.log('localStorage check', localStorage.getItem("storedData"));
    })
  
}
function filterList(list, query) {
    return list.filter((item) => {
        if (item.Title){
            const lowerCaseName = (item.Title || "").toLowerCase();
            const lowerCaseQuery = (query || "").toLowerCase();
            return lowerCaseName.includes(lowerCaseQuery);
        } else if (item.company){
            const lowerCaseName = (item.company || "").toLowerCase();
            const lowerCaseQuery = (query || "").toLowerCase();
            return lowerCaseName.includes(lowerCaseQuery);
        }
      
    })
}
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
  }

function injectHTML(list) {
    console.log('fired injectHTML');
    const target = document.querySelector("#jobs_list")
    let companyName = '';
    let companyUrl = '';
    target.innerHTML = '';
    list.forEach((item, index) => {
        if (item.company){
            companyName = item.company;
        }
        if (item.URL){
            companyUrl = item.URL;
        }
        if (item.Title && companyName != ''){
            const str = `<li><a href="${companyUrl}">${item.Title}</a>, at ${companyName}</li>`
            target.innerHTML += str
        }
    })

}

  
function  cutList(list){
    console.log("fired cut list")
    const range = [...Array(15).keys()];
    return newArray = range.map((item) => {
      const index = getRandomInt(0, list.length - 1);
      return list[index] 
    })
  }

function initMap(){
    const mapList = L.map('map').setView([37.7749, -122.4194], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(mapList);
return mapList;
}

function markerPlace(array, map){
    console.log('array for markers', array);

    map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          layer.remove();
        }
      });

    array.forEach((item) => {
        console.log('markerplace', item);
        if (item.company){
            if (item.company == "Patreon"){
                L.marker([37.772556, -122.403661]).addTo(map);
            } else if (item.company == "PagerDuty"){
                L.marker([37.772494, -122.403717]).addTo(map);
                
            } else if (item.company == "Postman"){
                L.marker([37.790778, -122.401604]).addTo(map);
            }
        }
       
    })

  }


  function drawChart(list){
    let companyNames = [];
    list.forEach((item, index) => {
        if (item.company){
            companyNames.push(item.company);
        }
    })

    console.log(companyNames);
    let dataPoints = companyNames.map(companyName => ({ label: companyName, y: 2 }));

    let chart = new CanvasJS.Chart("chartContainer", {
        theme: "light1", // "light2", "dark1", "dark2"
        animationEnabled: false, // change to true		
        title:{
            text: "Job openings by company"
        },
        data: [
        {
            type: "column",
            dataPoints: dataPoints
        }
        ]
    });
    chart.render();
}

document.addEventListener('DOMContentLoaded', async () => mainEvent());