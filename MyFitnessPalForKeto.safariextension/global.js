var MyFitnessPalForKeto = {

	initialize: function () {
		this.summary.initialize();
		this.food.initialize();
	},


	summary: {

		initialize: function () {
			var summary, request, self = this;

			this.container = document.getElementById('daily-summary');
			if (this.container) {

				request = new XMLHttpRequest();
				request.onreadystatechange = function () {
					if (request.readyState === 4 && request.status === 200 && request.responseText !== '') {
						self.parseResponseTextAsFood(request.responseText);
					}
				};
				request.open('GET', '/food/diary', true);
				request.send();

			}
			return this;
		},

		parseResponseTextAsFood: function (responseText) {
			var text, container, food;
			responseText = responseText.replace(/(\r\n|\n|\r)/gm, ' ').replace(/^.*<table[^>]*>(.*)<\/table>.*$/, '$1');
			if (responseText !== '') {
				container = document.createElement('table');
				container.innerHTML = responseText;
				this.insertSummaryFromFood(MyFitnessPalForKeto.food.initialize(container));
			}
		},

		insertSummaryFromFood: function (food) {
			var container, number, title, cols, picture;

			container = document.createDocumentFragment();
			container.appendChild(this.container.querySelector('#calories-remaining').cloneNode(true));
			container.appendChild(this.container.querySelector('#daily-stats').cloneNode(true));

			number = container.querySelector('#calories-remaining-number');
			number.textContent = food.columns.netcarbs.remaining;
			number.className = (parseInt(food.columns.netcarbs.remaining, 10) < 0) ? 'negative' : 'positive';

			title  = container.querySelector('#calories-remaining-label');
			title.textContent = title.textContent.replace('Calories', 'Net Carbs');

			cols = container.querySelectorAll('#daily-stats tbody td');
			cols[0].textContent = food.columns.netcarbs.goal;
			cols[1].textContent = food.columns.netcarbs.total;
			cols[2].parentNode.removeChild(cols[2]);
			cols[3].parentNode.removeChild(cols[3]);

			cols = container.querySelectorAll('#daily-stats thead td:nth-child(n+3)');
			cols[0].parentNode.removeChild(cols[0]);
			cols[1].parentNode.removeChild(cols[1]);

			this.container.insertBefore(container, this.container.querySelector('#calories-remaining'));

			picture = this.container.querySelector('#mypicholder');
			picture.style.marginBottom = picture.offsetHeight + 'px';
		}

	},


	food: {

		columns: {
			'calories': {},
			'netcarbs': {},
			'carbs': {},
			'fiber': {},
			'fat': {},
			'protein': {}
		},

		initialize: function (container) {
			this.container = container || document.querySelector('.container table');
			if (this.container) {
				this.determineColumnIndex();

				if (typeof this.columns.fiber.index === 'number' && typeof this.columns.carbs.index === 'number') {
					this.addNetCarbColumn();
					this.determineColumnIndex();
					this.calculateNetCarbs();
				}

				if (typeof this.columns.netcarbs.index === 'number' && typeof this.columns.fat.index === 'number' && typeof this.columns.protein.index === 'number') {
					this.calculatePercentages();
					this.createChart();
				}

			}
			return this;
		},

		determineColumnIndex: function () {
			var cells, i, key;
			cells = this.container.querySelectorAll('tr.meal_header:first-child td');
			if (cells.length) {
				for (i = cells.length - 1; i >= 0; i -= 1) {
					key = cells[i].textContent.toLowerCase().replace(' ', '');
					if (this.columns[key]) {
						this.columns[key].index = i;
					}
				}
			}
		},

		addNetCarbColumn: function () {
			var cell, rows, i, carbCell, carbCol;

			cell = document.createElement('td');
			rows = this.container.querySelectorAll('tr');
			for (i = rows.length - 1; i >= 0; i -= 1) {
				if (i === 0 || i === rows.length - 1) {
					cell.className = 'alt';
					cell.textContent = 'Net Carbs';
				} else {
					cell.className = 'alt';
					cell.textContent = 'Net Carbs';
				}

				carbCell = rows[i].querySelector('td:nth-child(' + (this.columns.carbs.index + 1) + ')');
				if (carbCell) {
					rows[i].insertBefore(cell.cloneNode(true), carbCell);
				}
			}

			carbCol = this.container.querySelector('colgroup col:nth-child(' + (this.columns.carbs.index + 1) + ')');
			carbCol.parentNode.insertBefore(carbCol.cloneNode(true), carbCol);
		},

		calculateNetCarbs: function () {
			var rows, i, carbs, fiber, netcarbs, carb_goal, total_netcarbs;

			rows = this.container.querySelectorAll('tr:not(.spacer)');
			for (i = 1; i < rows.length; i++) {
				if (rows[i].children.length >= this.columns.carbs.index && rows[i].children.length >= this.columns.fiber.index) {
					carbs = parseInt(rows[i].children[this.columns.carbs.index].textContent, 10);
					fiber = parseInt(rows[i].children[this.columns.fiber.index].textContent, 10);
					netcarbs = carbs - fiber;

					if (rows[i].children[0].textContent.search('Totals') > -1){
						total_netcarbs = netcarbs;
					}
					if (rows[i].children[0].textContent.search('Your Daily Goal') > -1){
						rows[i].children[this.columns.netcarbs.index].textContent = carbs;	
						carb_goal = carbs;					
					}else if (rows[i].children[0].textContent.search('Remaining') > -1){
						rows[i].children[this.columns.netcarbs.index].textContent = carb_goal - total_netcarbs;	
					}else{
						if (!isNaN(netcarbs) && netcarbs > 0) {
							rows[i].children[this.columns.netcarbs.index].textContent = netcarbs;
						} else if (rows[i].className.match('total')) {
							rows[i].children[this.columns.netcarbs.index].textContent = '0';
						} else if (netcarbs <= 0){
							rows[i].children[this.columns.netcarbs.index].textContent = '0';							
						}						
					}
				
				
					if (rows[i].className.match('remaining')) {
						this.columns.netcarbs.remaining = carb_goal - total_netcarbs;
						if (carb_goal - total_netcarbs > 0) {
							rows[i].children[this.columns.netcarbs.index].className = 'positive';
						} else if (carb_goal - total_netcarbs < 0) {
							rows[i].children[this.columns.netcarbs.index].className = 'negative';
						}
					} else if (rows[i].className.match('total') && rows[i].className.match('alt')) {
						this.columns.netcarbs.goal = carb_goal;
					} else if (rows[i].className.match('total')) {
						this.columns.netcarbs.total = netcarbs ;
					}
				}
			}
		},

		calculatePercentages: function () {
			var bottoms, totals, rows, i, carbCals, proteinCals, fatCals, cals, carbPer, proteinPer, fatPer, color;

			bottoms = this.container.querySelectorAll('tr.bottom');
			totals = this.container.querySelectorAll('tr.total:not(.remaining)');
			rows = Array.prototype.slice.call(bottoms).concat(Array.prototype.slice.call(totals));

			for (i = rows.length - 1; i >= 0; i -= 1) {
				carbCals    = parseInt(rows[i].children[this.columns.netcarbs.index].textContent, 10) * 4;
				proteinCals = parseInt(rows[i].children[this.columns.protein.index].textContent, 10) * 4;
				fatCals     = parseInt(rows[i].children[this.columns.fat.index].textContent, 10) * 9;

				cals = carbCals + proteinCals + fatCals;

				carbPer    = Math.round((carbCals    / cals).toFixed(2) * 100);
				proteinPer = Math.round((proteinCals / cals).toFixed(2) * 100);
				fatPer     = Math.round((fatCals     / cals).toFixed(2) * 100);

				color = (rows[i].className.match('total')) ? '#0f73ab' : '#000';
				if (!isNaN(carbPer)) {
					rows[i].children[this.columns.netcarbs.index].innerHTML += '<br /><span style="color:' + color + '; font-size:10px;">' + carbPer + '%</span>';
				}
				if (!isNaN(proteinPer)) {
					rows[i].children[this.columns.protein.index].innerHTML += '<br /><span style="color:' + color + '; font-size:10px;">' + proteinPer + '%</span>';
				}
				if (!isNaN(fatPer)) {
					rows[i].children[this.columns.fat.index].innerHTML += '<br /><span style="color:' + color + '; font-size:10px;">' + fatPer + '%</span>';
				}
			}
		},

		createChart: function () {
			var container, rows, i, netcarbs, protein, fat, img, noteform;
			container = document.querySelector('#complete_day + .block');
			if (container) {
				rows = this.container.querySelectorAll('tr.total:not(.remaining):not(.alt)');
				for (i = rows.length - 1; i >= 0; i -= 1) {
					netcarbs = rows[i].children[this.columns.netcarbs.index].innerHTML;
					protein = rows[i].children[this.columns.protein.index].innerHTML;
					fat     = rows[i].children[this.columns.fat.index].innerHTML;

					img = new Image();
					img.src = 'http://chart.apis.google.com/chart?chd=t:' + netcarbs.replace(/<.*/, '') + ',' + protein.replace(/<.*/, '') + ',' + fat.replace(/<.*/, '') + '&chdl=Net+Carb+' + netcarbs.replace(/.*\>(\d+\%)<.*/, '$1') + '|Protein+' + protein.replace(/.*\>(\d+\%)<.*/, '$1') + '|Fat+' + fat.replace(/.*\>(\d+\%)<.*/, '$1') + '&chs=200x220&cht=p&chco=f7941e|CAE6f2|2B9ACB&chdlp=b';
					img.style.cssFloat = 'left';
					img.style.margin = '-30px 20px 20px -10px';

					document.querySelector('.water-consumption').style.width = '205px';
					noteform = document.querySelector('#noteform');
					noteform.querySelector('#notes .notes').style.width = '245px';
					noteform.parentNode.insertBefore(img, noteform);
				}
			}
		}

	}


};


// do not run in frames
if (window.top === window.self) {
	MyFitnessPalForKeto.initialize();
}
