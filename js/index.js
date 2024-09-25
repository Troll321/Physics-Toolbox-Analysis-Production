import Chart from "chart.js/auto"

const fileE = document.getElementById("file");
const massE = document.getElementById("mass");

const rawE = document.getElementById("raw");
const velE = document.getElementById("vel");
const dispE = document.getElementById("displacement");
const forceE = document.getElementById("force");
const distE = document.getElementById("distance");
const workE = document.getElementById("work");
const lstsxE = document.getElementById("lstsx");
const lstsyE = document.getElementById("lstsy");
const lstszE = document.getElementById("lstsz");
const lstdistE = document.getElementById("lstdist");
const lstworkE = document.getElementById("lstwork");

fileE.addEventListener("change", e => {
    updateData();
});
massE.addEventListener("change", e => {
    updateData();
})

const myOptions = {
    options: {
        data: {
            backgroundColor: "rgba(255,0,0,1)"
        },
        barThickness: 1
    }
};

function getBarDataOptions(index) {
    let color = "";
    switch (index) {
        case 0:
            color = "64, 161, 234"
            break;
        case 1:
            color = "252, 104, 133"
            break ;
        case 2:
            color = "252, 161, 70"
            break ;
        case 3:
            color = "253, 206, 91"
            break ;
        default: 
            color = "191, 245, 76"
            break ;
    }
    return {
        backgroundColor: `rgba(${color},1)`,
        borderColor: `rgba(0,0,0,1)`,
        pointStyle: true
    };
}

let myCharts = [];

function updateData() {
    const file = fileE.files[0];
    if(!file) {return ;}

    console.log("Cleaning Up!");
    while(myCharts.length > 0) {
        myCharts[myCharts.length-1].destroy();
        myCharts.pop();
    }
    
    console.log("Reading!");
    const reader = new FileReader();
    reader.addEventListener("load", e => {
        // Column 0 --> Time
        // ACCELERATION
        const mass = parseFloat(massE.value) || 0;
        let arr = reader.result.split("\n").map(now => {return now.split(",").map(
            val => {
                return !isNaN(parseFloat(val)) ? parseFloat(val) : val;
        });});
        if (arr[0].length !== arr[1].length) {
            arr = reader.result.split("\n").map(now => {return now.split(";").map(
                val => {
                    return !isNaN(parseFloat(val.split(",").join("."))) ? parseFloat(val.split(",").join(".")) : val;
            });});
        }

        const header = arr[0].map(now => {let tmp = now.split(""); tmp.shift(); return tmp.join("").split(" ")[0];});
        arr.shift();
        header.shift();
        const time = arr.map(now => {return now[0];});

        arr = arr.map(now => {let bek = now; now.shift(); return bek;});

        const rawDatasets = [];
        for (let i = 0; i < header.length; i++) {
            rawDatasets.push({
                label: "a"+header[i],
                data: arr.map(now => {return now[i];}),
                ...getBarDataOptions(i)
            });
        }

        myCharts.push(new Chart(rawE, {
            type: "bar",
            data: {
                labels: time,
                datasets: rawDatasets,
            },
            ...myOptions,
        }));

        // Velocity
        const velDataset = [];
        for (let i = 0; i < header.length; i++) {
            let velArr = [];
            for (let j = 0; j < time.length; j++) {
                velArr.push(0);
                if(j == 0) {continue ;}
                if(i == header.length-1) {
                    velArr[j] = Math.sqrt(velDataset[0].data[j]**2 + velDataset[1].data[j]**2 + velDataset[2].data[j]**2);
                    continue ;
                }
                velArr[j] = velArr[j-1] + ((time[j]-time[j-1])*arr[j-1][i]);
                if(!velArr[j]) {
                    console.log(velArr[j], (time[j]-time[j-1]), arr[j-1][i]);
                }
            }
            velArr.pop();
            velDataset.push({
                label: "v"+header[i],
                data: velArr
            });
        }

        myCharts.push(new Chart(velE, {
            type: "line",
            data: {
                labels: time,
                datasets: velDataset
            },
            ...myOptions
        }));

        // Displacement
        const dispDataset = [];
        for (let i = 0; i < header.length; i++) {
            let dispArr = [];
            for (let j = 0; j < time.length; j++) {
                dispArr.push(0);
                if(j == 0) {continue ;}
                if(i == header.length-1) {
                    dispArr[j] = Math.sqrt(dispDataset[0].data[j]**2 + dispDataset[1].data[j]**2 + dispDataset[2].data[j]**2);
                    continue ;
                }
                dispArr[j] = dispArr[j-1] + ((time[j]-time[j-1])*(velDataset[i].data[j]+velDataset[i].data[j-1])/2);
            }
            dispArr.pop();
            dispDataset.push({
                label: "s"+header[i],
                data: dispArr
            });
            
        }

        myCharts.push(new Chart(dispE, {
            type: "line",
            data: {
                labels: time,
                datasets: dispDataset
            },
            ...myOptions
        }));
        lstsxE.innerText = dispDataset[0].data[dispDataset[0].data.length-1];
        lstsyE.innerText = dispDataset[1].data[dispDataset[1].data.length-1];
        lstszE.innerText = dispDataset[2].data[dispDataset[2].data.length-1];

        // Force
        const forceDataset = [];
        for (let i = 0; i < header.length; i++) {
            let forceArr = [];
            for (let j = 0; j < time.length; j++) {
                forceArr.push(0);
                if(j == 0) {continue ;}
                forceArr[j] = rawDatasets[i].data[j]*mass;
            }
            forceArr.pop();
            forceDataset.push({
                label: "f"+header[i],
                data: forceArr,
                ...getBarDataOptions(i)
            });
            
        }

        myCharts.push(new Chart(forceE, {
            type: "bar",
            data: {
                labels: time,
                datasets: forceDataset
            },
            ...myOptions
        }));


        // Distance
        const distDataset = [];
        let distArr = [];
        for (let j = 0; j < time.length; j++) {
            distArr.push(0);
            if(j == 0) {continue ;}
            distArr[j] = distArr[j-1] + Math.sqrt((dispDataset[0].data[j]-dispDataset[0].data[j-1])**2 + (dispDataset[1].data[j]-dispDataset[1].data[j-1])**2 + (dispDataset[2].data[j]-dispDataset[2].data[j-1])**2);
        }
        distArr.pop();
        distDataset.push({
            label: "dist",
            data: distArr
        });

        myCharts.push(new Chart(distE, {
            type: "line",
            data: {
                labels: time,
                datasets: distDataset
            },
            ...myOptions
        }));
        lstdistE.innerText = distArr[distArr.length-1];


        // Work
        const workDataset = [];
        let workArr = [];
        for (let j = 0; j < time.length; j++) {
            workArr.push(0);
            if(j == 0) {continue ;}
            const deltaS = [dispDataset[0].data[j]-dispDataset[0].data[j-1], dispDataset[1].data[j]-dispDataset[1].data[j-1], dispDataset[2].data[j]-dispDataset[2].data[j-1]];
            workArr[j] = workArr[j-1] + (deltaS[0]*forceDataset[0].data[j-1] + deltaS[1]*forceDataset[1].data[j-1] + deltaS[2]*forceDataset[2].data[j-1]);
        }
        workArr.pop();
        workDataset.push({
            label: "work",
            data: workArr
        });
            

        myCharts.push(new Chart(workE, {
            type: "line",
            data: {
                labels: time,
                datasets: workDataset
            },
            ...myOptions
        }));
        lstworkE.innerText = workArr[workArr.length-1];
    });
    reader.readAsText(file);
}