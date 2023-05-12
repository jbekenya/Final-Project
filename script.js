async function mainEvent() {
    const form = document.querySelector(".main_form");
    const loadJobData = document.querySelector("#load_job_data");
    const generateListButton = document.querySelector("#generate");
    const resetList = document.querySelector("#reset_data");
    //const textField = document.querySelector("#company");
    const companyTextField = document.querySelector("#company");
    const storedList = localStorage.getItem("storedList"); //local storage for the list of jobs
  
    const mapList = initMap();
    let parsedData = JSON.parse(storedList);
    let jobList = [];
  
    loadJobData.addEventListener("click", async (submitEvent) => {
      const results = await fetch(
        "https://901522ec-fa4d-4b63-aecc-a237dc24ac90.mock.pstmn.io/jobs/"
      );
      let resultsBody = await results.text();
      resultsBody = resultsBody.replace(/[\u0000-\u001F]/g, "");
      localStorage.setItem("storedList", JSON.stringify(resultsBody));
      parsedData = JSON.parse(resultsBody);
      console.log(parsedData);
  
      if (parsedData?.length > 0) {
        generateListButton.classList.remove("hidden");
      }
  
      skills = skillsOnDemand(parsedData);
      drawChart(skills);
    });
  
    generateListButton.addEventListener("click", (event) => {
      jobList = cutList(parsedData);
      // saveToLocalStorage(jobList);
      console.log("generate new list", jobList);
      injectHTML(jobList);
      markerPlace(jobList, mapList);
    });
  
    companyTextField.addEventListener("input", (event) => {
      console.log("input", event.target.value);
      const filteredList = filterList(
        parsedData,
        event.target.value.trim().toLowerCase()
      );
      console.log(filteredList);
      injectHTML(filteredList);
      markerPlace(filteredList, mapList);
    });
  
    // a function that that will swap out the localStorage for something new.
    resetList.addEventListener("click", (event) => {
      console.log("clear browser data");
      localStorage.removeItem("storedList"); // Step 1
      location.reload(); 
    });
  }
  
  function filterList(list, query) {
    return list.filter((item) => {
      const lowerCaseQuery = (query || "").toLowerCase();
      if (item.Title && item.Title.toLowerCase().includes(lowerCaseQuery)) {
        return item.Title.toLowerCase().includes(lowerCaseQuery);
      }
      if (item.company && item.company.toLowerCase().includes(lowerCaseQuery)) {
        console.log(item.company.toLowerCase().includes(lowerCaseQuery));
        return item.company.toLowerCase().includes(lowerCaseQuery);
      }
      return false;
    });
  }
  
  
  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
  }
  
  function injectHTML(list) {
    console.log("fired injectHTML");
    const target = document.querySelector("#jobs_list");
    let companyName = "";
    let companyUrl = "";
    target.innerHTML = "";
    list.forEach((item, index) => {
      if (item.company) {
        companyName = item.company;
      }
      if (item.URL) {
        companyUrl = item.URL;
      }
      if (item.Title && companyName != "") {
        const str = `<li><a href="${companyUrl}">${item.Title}</a>, at ${companyName}</li>`
            target.innerHTML += str
        }
    })

}
// creates a dictionary with the skills on demand

function skillsOnDemand(list){
  let jobDescription = [];
  // skills to look for: lead, product, teams 
  let keywordCounts = {
    "Lead": 0,
    "Product": 0,
    "Teams": 0
  };
  list.forEach((item, index) => {
      if (item.Description) {
        jobDescription.push(item.Description);
      }
});
for (var i = 0; i < jobDescription.length; i++) {
  var description = jobDescription[i];

  // Count the number of times each keyword appears in the description
  keywordCounts.Lead += (description.match(/lead/gi) || []).length;
  keywordCounts.Product += (description.match(/product/gi) || []).length;
  keywordCounts.Teams += (description.match(/teams/gi) || []).length;
  //keywordCounts.Engineer += (description.match(/engineer/gi)|| []).length;
}
  
  return keywordCounts
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

  function drawChart(dict) {
    // Convert the dictionary into an array of data points
    let dataPoints = Object.entries(dict).map(([key, value]) => ({ label: key, y: value }));
  
    let chart = new CanvasJS.Chart("chartContainer", {
      theme: "light1", // "light2", "dark1", "dark2"
      animationEnabled: false, // change to true		
      title: {
        text: "Skills on Demand Based on Job Descriptions"
      },
      data: [{
        type: "column",
        dataPoints: dataPoints
      }]
    });
  
    chart.render();
  }

document.addEventListener('DOMContentLoaded', async () => mainEvent());