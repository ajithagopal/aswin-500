var myScatterplot = {
    // Variables
    margin: { top: 20, right: 30, bottom: 50, left: 60 },
    //width: 960 - this.margin.left - this.margin.right,
    //height: 500 - this.margin.top - this.margin.bottom,
	get width() { 
        return 960 - this.margin.left - this.margin.right;
    },
    get height() {
        return 500 - this.margin.top - this.margin.bottom;
    },
	tooltip: d3.select("#scatterplot").append("div") 
        .attr("class", "tooltip") 
        .style("opacity", 0),
	teamDropdown: document.getElementById('teamDropdown'), 
	x: null,
	y: null,
	isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,

	setupSVG: function() {
		this.svg = d3.select("#scatterplot").append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
			
		// Declare scales inside setupSVG
        this.x = d3.scaleLinear().range([0, this.width]); 
        this.y = d3.scaleLinear().range([this.height, 30]);
		
		    // Add the axis creation code here
    this.svg.append("g")
        .attr("transform", "translate(0," + this.height + ")") 
        .attr("class", "x-axis");

    this.svg.append("g")
        .attr("class", "y-axis");
		
	    // Add x-axis label
    this.svg.append("text") 
        .attr("class", "x-axis-label")
        .attr("x", this.width / 2)  // Position in the middle of the x-axis 
        .attr("y", this.height + this.margin.bottom ) // Adjust vertical position as needed
        .style("text-anchor", "middle") 
        .text("Wickets");

    // Add y-axis label (with rotation for reversed effect)
    this.svg.append("text") 
        .attr("class", "y-axis-label")
        .attr("x", -(this.height / 2))  // Position in the middle of the y-axis
        .attr("y", -this.margin.left + 20 ) // Adjust horizontal position as needed
        .attr("transform", "rotate(-90)") // Rotate the text
        .style("text-anchor", "middle") 
        .text("Strike Rate (Reversed)");
	},		
		

    // Functions 
	loadData: function() { 
	   return new Promise((resolve, reject) => {
		   var datasetType = datasetDropdown.value; // Access value directly
		   var selectedType = typeDropdown.value;  // Access value directly
		   var selectedTeam = teamDropdown.value;  // Access value directly


			d3.csv("./assets/charts/chart-2/bowlerscatterall.csv").then(function(data) {
				myScatterplot.populateTeamDropdown(data); // Populate team dropdown based on loaded data

				var processedData = data.map(d => ({
					...d,
					Wickets: datasetType === "Away" ? +d.Owickets : +d.Wickets,
					Balls: datasetType === "Away" ? +d.Oballs : +d.Balls,
					StrikeRate: datasetType === "Away" ? +d.OstrikeRate : +d.StrikeRate,
					Matches: datasetType === "Away" ? d.OMatches : d.Matches,
					Name: d.Name.trim(),
					Type: d.Type.trim(),
					Team: d.Team.trim()
				})).filter(d => (datasetType !== "Away" || (+d.Balls !== -99 && +d.Wickets !== -99)) &&
				 (selectedType === "All" || d.Type === selectedType) &&
				 (selectedTeam === "All" || d.Team === selectedTeam));
				resolve(processedData);
			}).catch(error => reject(error));
		});
},

	populateTeamDropdown: function(data) {
		var uniqueTeams = [...new Set(data.map(d => d.Team))];

		// Use d3.select to make teamDropdown a D3 selection
		d3.select(teamDropdown).selectAll("*").remove(); // Clear existing options
		d3.select(teamDropdown).selectAll("option")
			.data(["All", ...uniqueTeams])
			.enter().append("option")
			.attr("value", d => d)
			.text(d => d);
	},


    updateScatterplot: function(data) {
		var self = this; // Keep a reference to the current context
		
		this.x.domain([70, d3.max(data, d => d.Wickets)]);
		this.y.domain([d3.max(data, d => d.StrikeRate), 30]);
			//isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0;
	
		myScatterplot.svg.select(".x-axis").transition().call(d3.axisBottom(this.x));
		myScatterplot.svg.select(".y-axis").transition().call(d3.axisLeft(this.y));
	
		// Select player groups or create them if they don't exist
		var playerGroups = this.svg.selectAll(".player")
			.data(data, function(d) { return d.Name; });
	
		// Remove player groups that are no longer in the data
		playerGroups.exit().remove();
	
		// Create new player groups for new data points
		var newPlayerGroups = playerGroups.enter()
			.append("g")
			.attr("class", "player")
			.attr("transform", d => `translate(${self.x(d.Wickets)},${self.y(d.StrikeRate)})`);
	
		// For each new player group, decide whether to append a circle or an image
		newPlayerGroups.each(function(d) {
			var playerGroup = d3.select(this);
			if (d.Name === "R Ashwin") {
				var img = playerGroup.append("image")
					.attr("xlink:href", "assets/images/ashwin-dp.png") // Specify the URL of R Ashwin's image
					.attr("width", 30) // Adjust as needed
					.attr("height", 30) // Adjust as needed
					.attr("x", -10) // Center the image
					.attr("y", -10); // Center the image
				self.attachEventHandlers(img, d); // Attach event handlers
			} else {
				var circle = playerGroup.append("circle")
					.attr("r", 5) // Radius of the circle
					.style("fill", d => d.Type === "Spin" ? "#4791FF" : "#BC4602");
				self.attachEventHandlers(circle, d); // Attach event handlers
			}
		});
	
		// Update the positions of existing player groups
		playerGroups.transition().duration(500)
			.attr("transform", d => `translate(${self.x(d.Wickets)},${self.y(d.StrikeRate)})`);
	},
	
	attachEventHandlers: function(selection, d) {
		var self = this;
		selection
			.on("mouseover", (event, d) => {
				if (!self.isTouchDevice) { // Only for desktop
					var datasetType = datasetDropdown.value; // Assume datasetDropdown is defined elsewhere
					var displayWickets = datasetType === "Away" ? d.Owickets : d.Wickets;
					var displayStrikeRate = datasetType === "Away" ? d.OstrikeRate : d.StrikeRate;
	
					self.tooltip.transition().duration(200).style("opacity", .9);
					self.tooltip.html(`BowlerName: ${d.Name}<br/>Wickets: ${displayWickets}<br/>StrikeRate: ${displayStrikeRate}`)
						.style("left", (event.pageX) + "px")
						.style("top", (event.pageY - 28) + "px");
				}
			})
			.on("mouseout", () => {
				if (!self.isTouchDevice) {
					self.tooltip.transition().duration(500).style("opacity", 0);
				}
			})
			.on("touchstart", (event, d) => {
				var datasetType = datasetDropdown.value; // Assume datasetDropdown is defined elsewhere
				var displayWickets = datasetType === "Away" ? d.Owickets : d.Wickets;
				var displayStrikeRate = datasetType === "Away" ? d.OstrikeRate : d.StrikeRate;
	
				self.tooltip.transition().duration(200).style("opacity", .9);
				self.tooltip.html(`BowlerName: ${d.Name}<br/>Wickets: ${displayWickets}<br/>StrikeRate: ${displayStrikeRate}`)
					.style("left", (event.touches[0].pageX) + "px")
					.style("top", (event.touches[0].pageY - 28) + "px");
			})
			.on("touchend", () => {
				self.tooltip.transition().duration(500).style("opacity", 0);
			});
	},

    updateMedians: function(data,svg) {
        // ... (Your updateMedians function with modifications to use the namespace)
		var datasetType = datasetDropdown.value;
		var selectedType = typeDropdown.value;
		var selectedTeam = teamDropdown.value; // Ensure team filtering if needed

		var filteredData = data.filter(d => (selectedType === "All" || d.Type === selectedType) &&
											(selectedTeam === "All" || d.Team === selectedTeam));

		var medianWickets = d3.median(filteredData, d => datasetType === "Away" ? +d.Owickets : +d.Wickets);
		var medianStrikeRate = d3.median(filteredData, d => datasetType === "Away" ? +d.OstrikeRate : +d.StrikeRate);

		// Clear previous medians
		svg.selectAll(".median-line").remove();
		svg.selectAll(".median-label").remove();
		
		console.log("Value of dropdowns", selectedType, "and",datasetType, "and",  selectedTeam);
		console.log("Value of medianWickets",medianWickets);
		console.log("Value of medianWickets",medianStrikeRate);
		console.log("Filtered Data", filteredData);
		

		// Draw median lines and labels for Wickets
		svg.append("line")
			.attr("class", "median-line")
			.style("stroke", "black")
			.style("stroke-width", 2)
			.style("stroke-dasharray", "5,5") // Set the line to be dashed
			.attr("x1", this.x(medianWickets))
			.attr("x2", this.x(medianWickets))
			.attr("y1", 0)
			.attr("y2", this.height);

		svg.append("text")
		  .attr("class", "median-label")
		  .attr("x", this.x(medianWickets) + 10) // Adjust the offset as needed
		  .attr("y", 5)
		  .style("text-anchor", "start") // Align text to start from the x position
		  .text(`Median Wkts: ${medianWickets.toFixed(1)}`);


		// Draw median lines and labels for Strike Rate
		svg.append("line")
			.attr("class", "median-line")
			.style("stroke", "red")
			.style("stroke-width", 2)
			.style("stroke-dasharray", "5,5") // Set the line to be dashed
			.attr("x1", 0)
			.attr("x2", this.width)
			.attr("y1", this.y(medianStrikeRate))
			.attr("y2", this.y(medianStrikeRate));

		  svg.append("text")
			  .attr("class", "median-label")
			  .attr("x", this.width)
			  .attr("y", this.y(medianStrikeRate) - 5)
			  .attr("text-anchor", "end")
			  .text(`Median SR: ${medianStrikeRate.toFixed(1)}`);
	},

    init: function() { 
        // Renamed the function for clarity
        this.setupSVG(); 
		
		// Event listener for "Render button" 
        d3.select("#renderButton").on("click", function() {
            myScatterplot.loadData().then(data => { 
                myScatterplot.updateScatterplot(data);
                myScatterplot.updateMedians(data, myScatterplot.svg);
            }).catch(error => console.error("Error loading or updating data: ", error));
        });


        // Rest of your initialization code
        this.loadData().then(data => {
            this.updateScatterplot(data);
            this.updateMedians(data, myScatterplot.svg);
        }).catch(error => console.error("Error on initial data load: ", error));
    },
};

// Initialize your scatterplot
myScatterplot.init(); 