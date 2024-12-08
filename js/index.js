import Chart from "chart.js/auto"
import { isNumber } from "chart.js/helpers";

const GRAVITY = 9.80665;

const fileE = document.getElementById("file");
const massE = document.getElementById("mass");
const exportE = document.getElementById("export");
const limiterE = document.getElementById("limiter");
const IgravE = document.getElementById("Igrav");

const rawE = document.getElementById("raw");
const velE = document.getElementById("vel");
const dispE = document.getElementById("displacement");
const forceE = document.getElementById("force");
const distE = document.getElementById("distance");
const workE = document.getElementById("work");
const energyE = document.getElementById("energy");
const lstsxE = document.getElementById("lstsx");
const lstsyE = document.getElementById("lstsy");
const lstszE = document.getElementById("lstsz");
const lstdistE = document.getElementById("lstdist");
const lstworkE = document.getElementById("lstwork");
const lstworkpE = document.getElementById("lstworkp");
const lstworkmE = document.getElementById("lstworkm");
const lstemE = document.getElementById("lstem");

let content = [];

fileE.addEventListener("change", () => {
    updateData();
});
massE.addEventListener("change", () => {
    updateData();
});
limiterE.addEventListener("change", () => {
    updateData();
});
IgravE.addEventListener("change", () => {
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

    content = [];
    exportE.href = `javascript:void(0)`;

    console.log("Cleaning Up!");
    while(myCharts.length > 0) {
        myCharts[myCharts.length-1].destroy();
        myCharts.pop();
    }
    
    console.log("Reading!");
    const reader = new FileReader();
    let isGyro = false;
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

        if(header.length < 4) {
            isGyro = true;
            header.push("tot");
            for (let i = 0; i < 4; i++) {
                if(i == 3) {
                    const nowData = [];
                    for (let j = 0; j < time.length; j++) {
                        nowData.push(0);
                        nowData[j] = Math.sqrt(rawDatasets[0].data[j]**2 + rawDatasets[1].data[j]**2 + rawDatasets[2].data[j]**2);
                    }
                    nowData.pop();

                    rawDatasets.push({
                        label: "α"+header[i],
                        data: nowData,
                        ...getBarDataOptions(i)
                    });
                    break ;
                } else {
                    const nowData = [];
                    for (let j = 0; j < arr.length-1; j++) {
                        nowData.push(0);
                        nowData[j] = (arr[j+1][i]-arr[j][i])/(time[j+1]-time[j]);
                    }
                    rawDatasets.push({
                        label: "α"+header[i],
                        data: nowData,
                        ...getBarDataOptions(i)
                    });
                }
            }
        } else {
            for (let i = 0; i < header.length; i++) {
                rawDatasets.push({
                    label: "a"+header[i],
                    data: arr.map(now => {return now[i];}),
                    ...getBarDataOptions(i)
                });
            }
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
                if(isGyro) {
                    velArr[j] = arr[j][i];
                } else {
                    velArr[j] = velArr[j-1] + ((time[j]-time[j-1])*arr[j-1][i]);
                }
            }
            velArr.pop();
            velDataset.push({
                label: (isGyro ? "w" : "v") + header[i],
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
                if(isGyro) {
                    dispArr[j] = dispArr[j-1] + ((time[j]-time[j-1])*arr[j-1][i]);
                } else {
                    dispArr[j] = dispArr[j-1] + ((time[j]-time[j-1])*(velDataset[i].data[j]+velDataset[i].data[j-1])/2);
                }
            }
            dispArr.pop();
            dispDataset.push({
                label: (isGyro ? "θ" : "s")+header[i],
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
        const Igrav = IgravE.checked;
        const workDataset = [];
        const workHeaderName = ["", "+", "-"];
        for (let i = 0; i < 3; i++) {
            let workArr = [];
            for (let j = 0; j < time.length; j++) {
                workArr.push(0);
                if(j == 0) {continue ;}
                const deltaS = [dispDataset[0].data[j]-dispDataset[0].data[j-1], dispDataset[1].data[j]-dispDataset[1].data[j-1], dispDataset[2].data[j]-dispDataset[2].data[j-1]];
                const change = (deltaS[0]*forceDataset[0].data[j-1] + deltaS[1]*forceDataset[1].data[j-1] + deltaS[2]*(forceDataset[2].data[j-1] + Igrav*mass*GRAVITY));
                if(i == 0) {
                    workArr[j] = workArr[j-1] + change;
                } else if (i == 1) {
                    const berubah = (change > 0) ? change : 0;
                    workArr[j] = workArr[j-1] + berubah;
                } else {
                    const berubah = (change < 0) ? change : 0;
                    workArr[j] = workArr[j-1] + berubah;
                }
            }
            workArr.pop();
            workDataset.push({
                label: "work"+workHeaderName[i],
                data: workArr
            });
        }
        myCharts.push(new Chart(workE, {
            type: "line",
            data: {
                labels: time,
                datasets: workDataset
            },
            ...myOptions
        }));
        lstworkE.innerText = workDataset[0].data[workDataset[0].data.length-1];
        lstworkpE.innerText = workDataset[1].data[workDataset[1].data.length-1];
        lstworkmE.innerText = workDataset[2].data[workDataset[2].data.length-1];


        // Energy
        const energyDataset = [];
        const energyHeaderName = ["k", "p", "m"];
        for (let i = 0; i < 3; i++) {
            let energyArr = [];
            for (let j = 0; j < time.length; j++) {
                energyArr.push(0);
                if(j == 0) {continue ;}
                if(i == 0) {
                    energyArr[j] = mass*(velDataset[3].data[j]**2)/2;
                } else if (i == 1) {
                    energyArr[j] = mass*GRAVITY*dispDataset[2].data[j];
                } else {
                    energyArr[j] = energyDataset[0].data[j] + energyDataset[1].data[j];
                }
            }
            energyArr.pop();
            energyDataset.push({
                label: "ΔE"+energyHeaderName[i],
                data: energyArr
            });
        }
        myCharts.push(new Chart(energyE, {
            type: "line",
            data: {
                labels: time,
                datasets: energyDataset
            },
            ...myOptions
        }));
        lstemE.innerText = energyDataset[2].data[energyDataset[2].data.length-1];


        const datasets = [
        rawDatasets
        ,velDataset
        ,dispDataset
        ,forceDataset
        ,distDataset
        ,workDataset
        ,energyDataset
        ];

        const myHeader = ["time"];
        datasets.forEach(dataset => {
            dataset.forEach(ds => {
                myHeader.push(ds.label);
            });
        });
        content.push(myHeader);

        for (let i = 0; i < time.length; i++) {
            const myArr = [time[i]];
            datasets.forEach(dataset => {
                dataset.forEach(ds => {
                    myArr.push(ds.data[i]);
                });
            });
            content.push(myArr);
        }

        const limiter = limiterE.value || ",";
        exportE.href = `data:application/octet-stream,${content.map(arbek => {
            return arbek.map(val => {
                if(!isNumber(val)) {return val;}
                let mystr = val.toString();
                if(/e-/.test(mystr)) {
                    mystr = mystr.split("e-");
                    const jum = parseInt(mystr[1]);
                    mystr = mystr[0];
                    for (let w = 0; w < jum; w++) {
                        mystr += "0";                        
                    }
                    return mystr;
                } else {
                    return mystr;
                }
            }).join(limiter);
        }).join("%0A")}%0A`;
    });
    reader.readAsText(file);
}