let data;
let lines;

const renderVisualization = () => {
    const containerWidth = document.getElementById("visualization").clientWidth;
    const containerHeight = document.getElementById("visualization").clientHeight;

    const margin = {
        top: 0 * containerHeight,
        right: 0 * containerWidth,
        bottom: 0 * containerHeight,
        left: 0 * containerWidth
    };

    const width = containerWidth - (margin.right + margin.left);
    const height = containerHeight - (margin.top + margin.bottom);

    const svg = d3.select(`#visualization`);
    const chartArea = svg.append('g')
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const mapX = d => d.lon;
    const mapY = d => d.lat;

    const xExtent = d3.extent(data, mapX);
    const yExtent = d3.extent(data, mapY);

    const centerX = (xExtent[1] + xExtent[0]) / 2;
    const centerY = (yExtent[1] + yExtent[0]) / 2;
    const range = d3.max([xExtent[1] - xExtent[0], yExtent[1] - yExtent[0]]);

    const mapXScale = d3.scaleLinear().domain([centerX - range / 2, centerX + range / 2]).range([width / 4, 3 * width / 4]);
    const mapYScale = d3.scaleLinear().domain([centerY + range / 2, centerY - range / 2]).range([height / 4, 3 * height / 4]);

    // signature
    chartArea.selectAll("path")
        .data([data])
        .join("path")
        .attr("stroke", "#0006ba")
        .attr("stroke-width", 0.01 * width)
        .attr("opacity", 0.8)
        .attr("fill", "none")
        .attr("stroke-linecap", "round")
        .attr("d", d => {
            return d3.line()
                .x(c => mapXScale(c.lon))
                .y(c => mapYScale(c.lat))
                .curve(d3.curveCardinal)
                (d);
        });

    // pictures
    const pics = [];
    let numPics = 0;
    data.forEach(d => {
        d.pictures.forEach(p => {
            pics.push({ pic: p, index: numPics });
            numPics++;
        });
        numPics++;
    });
    
    const pictureScale = d3.scaleLinear().domain([0, numPics]).range([-Math.PI / 2, 3 / 2 * Math.PI]);

    const pictureSize = 0.08 * width;
    chartArea.selectAll("image")
        .data(pics)
        .join("image")
        .attr("width", pictureSize)
        .attr("height", pictureSize)
        .attr("x", p => 0.4 * width * Math.cos(pictureScale(p.index)) - pictureSize / 2)
        .attr("y", p => 0.4 * height * Math.sin(pictureScale(p.index)) - pictureSize / 2)
        .attr("transform", `translate(${width / 2}, ${height / 2})`)
        .attr("href", p => p.pic);

    const places = [
        { 
            name: "Barcelona",
            index: 1.5
        },
        { 
            name: "Bordeaux",
            index: 8
        },
        { 
            name: "Oslo",
            index: 13
        },
        { 
            name: "Tønsberg",
            index: 15.5
        },
        { 
            name: "Norrköping",
            index: 18.5
        },
        { 
            name: "Paris",
            index: 21
        },
        { 
            name: "Lyon",
            index: 23
        },
        { 
            name: "Chamonix",
            index: 25
        },
        { 
            name: "Milan",
            index: 27.5
        },
        { 
            name: "Nottingham",
            index: 30.5
        },
    ];

    const textRadius = 0.46 * width;
    chartArea.selectAll("path.text")
        .data([null])
        .join("path")
        .attr("id", "circle-path")
        .attr("class", "text")
        .attr("stroke-width", 0)
        .attr("fill", "none")
        .attr("d", `M ${width / 2}, ${height / 2}
                    m 0,-${textRadius}
                    a ${textRadius},${textRadius} 0 0,1 0,${textRadius * 2}
                    a ${textRadius},${textRadius} 0 0,1 0,-${textRadius * 2}`);


    chartArea.selectAll("text")
        .data(places)
        .join("text")
        .attr("text-anchor", "middle")
        .attr("stroke", "#0006ba")
        .attr("opacity", 0.8)
        .attr("font-family", '"Cedarville Cursive", cursive')
        .attr("font-weight", 200)
        .attr("text-multiplier", 1)
        .selectAll("textPath")
        .data(d => [d])
        .join("textPath")
        .attr("href", "#circle-path")
        .attr("startOffset", d => (100 * d.index / numPics) + "%")
        .text(d => d.name);
};

const resizeAndRender = () => {
    d3.selectAll("#visualization > *").remove();

    renderVisualization();

    d3.selectAll("text")
        .attr("font-size", function() { return d3.select(this).attr("text-multiplier") * 0.03 * document.getElementById("visualization").clientHeight });
};

window.onresize = resizeAndRender;

Promise.all([d3.json('data/data.json')]).then(([_data]) => {
    data = _data;
    data.forEach(d => {
        d.pictures = d.pictures.map(p => "images/trip/" + p + ".jpg");
    });

    resizeAndRender();
});