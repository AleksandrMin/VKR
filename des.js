      var canvas = document.getElementById('myCanvas');
			var context = canvas.getContext('2d');
			//Объекты модели
			var objs = {gen:[], process:[], buff:[], trans:[],comb:[], sep:[]};			
			//Последовательность объектов в модели
			var line = [];
			//Объект контролирующий состояние мыши
			var mouse = {x:0, y:0, down:false};			
			//Библиотека sim.js		
			var sim = new Sim();
			var stats = new Sim.Population();
			var buffer = [];
			buffer.push(new Sim.Buffer("buffer"+(buffer.length+1), 1));	
			var temp;
			var rand = new Random(1234);
			//Библиотека JS Charts (диаграмма)	
			var DetailChart = new Array([]);		
			var Chart = new JSChart('graph2', 'bar');
			Chart.setTitle('Quantity details on Stage');
			Chart.setTitleColor('#8E8E8E');
			Chart.setAxisNameX('');
			Chart.setAxisNameY('');
			Chart.setAxisColor('#C4C4C4');
			Chart.setAxisNameFontSize(16);
			Chart.setAxisNameColor('#999');
			Chart.setAxisValuesColor('#777');
			Chart.setAxisColor('#B5B5B5');
			Chart.setAxisWidth(1);
			Chart.setBarValuesColor('#2F6D99');
			Chart.setBarOpacity(0.5);
			Chart.setAxisPaddingTop(40);
			Chart.setAxisPaddingBottom(40);
			Chart.setAxisPaddingLeft(45);			
			Chart.setTitleFontSize(11);
			Chart.setBarBorderWidth(0);
			Chart.setBarSpacingRatio(50);
			Chart.setBarOpacity(0.9);
			Chart.setSize(500, 300);
			//Библиотека JS Charts (график)
			var r=0;
			var TimeData = new Array([]);
			var LineChart = new JSChart('graph1', 'line');			
			LineChart.setTitle('Components income');
			LineChart.setTitleColor('#8E8E8E');
			LineChart.setTitleFontSize(11);
			LineChart.setAxisNameX('');
			LineChart.setAxisNameY('');
			LineChart.setAxisColor('#C4C4C4');
			LineChart.setAxisValuesColor('#343434');
			LineChart.setAxisPaddingLeft(40);
			LineChart.setAxisPaddingRight(40);
			LineChart.setAxisPaddingTop(50);
			LineChart.setAxisPaddingBottom(40);
			LineChart.setAxisValuesDecimals(1);		
			LineChart.setGraphExtend(true);
			LineChart.setGridColor('#c2c2c2');
			LineChart.setLineWidth(6);
			LineChart.setLineColor('#3E90C9');
			LineChart.setSize(500, 300);
			
			
			//Модель:генератор деталей	
			var model_generation = function (x,y,color,id,Tmin,Tmax,NextBuff){
				this.x=x;
				this.y=y;
				this.color=color;
				this.id=id || 'gen 0';
				this.selected=false;				
				this.SumTime=[0];
				this.Tmin=Tmin || 10;
				this.Tmax=Tmax || 10;
				this.NextBuff=NextBuff;
				
				
				this.start=function () {					
					// Следующая деталь поступит в пределах интервала от времени от Tmin до Tmax
					var nextDetails = rand.uniform(this.Tmin, this.Tmax);
					//console.log(this.time()+"---"+this.NextBuff.current());					
					// Время ожидания при выполнении операции
					this.setTimer(nextDetails).done(function () {
						// Передать деталь на следующую операцию
						this.putBuffer(this.NextBuff, 1).done(function () {	
						
						this.SumTime[0]+=nextDetails;						
						//console.log(this.SumTime[0]);
						
						TimeData[r][0]=this.time();
						TimeData[r][1]=0;
						TimeData.push(new Array());
						r++;
						TimeData[r][0]=this.time();
						TimeData[r][1]=1;
						TimeData.push(new Array());
						r++;
						TimeData[r][0]=this.time();
						TimeData[r][1]=this.NextBuff.current();
						TimeData.push(new Array());						
						r++;
						TimeData[r][0]=this.time();
						TimeData[r][1]=0;
						TimeData.push(new Array());
						r++;
						
						//console.log(this.time()+"---"+this.NextBuff.current());
						this.start();
						});							
					});
					
				}		
			};				
			model_generation.prototype.draw = function(){
					var w = 60;
					var h = 30;
					var l = 20;
					context.beginPath();
					context.lineWidth = 5;
					context.strokeStyle = this.color;
					context.fillStyle = this.color;					
					context.fillRect(this.x-w/2, this.y-h/2, w, h);					
					context.moveTo(this.x+w/2, this.y);
					context.lineTo(this.x+w/2+l, this.y);
					context.closePath();
					context.fillStyle = "black";	
					context.font = 'italic 12pt Calibri';
					context.fillText(this.id,this.x-w/2.3,this.y+h/4.5);
					context.fill();
					context.stroke();
				};
			model_generation.prototype.move = function(){
					this.x=mouse.x;
					this.y=mouse.y;
				};
			//Модель:обработка деталей		
			var model_process = function (x,y,color,id,Tmin,Tmax,PrevBuff,NextBuff){
				this.x=x;
				this.y=y;
				this.color=color;
				this.id=id || 'proc 0';
				this.selected=false;
				this.SumTime=[0];
				this.Tmin=Tmin || 5;
				this.Tmax=Tmax || 5;
				this.PrevBuff=PrevBuff;
				this.NextBuff=NextBuff;
				
				this.start=function () {
					if(this.NextBuff.current()!=this.NextBuff.size()){						
							//Взять поступившую деталь в обработку
							this.getBuffer(this.PrevBuff, 1).done(function () {
								// Следующая деталь будет обрабатываться в пределах интервала от времени от Tmin до Tmax
								var serviceTime = rand.uniform(this.Tmin, this.Tmax);
								//console.log(this.time()+"***"+this.PrevBuff.current()+"***"+this.NextBuff.current());
								// Время ожидания при выполнении операции
								this.setTimer(serviceTime).done(function () {
									// Передать деталь на следующую операцию
									this.putBuffer(this.NextBuff, 1).done(function () {
									this.SumTime[0]+=serviceTime;
									this.start();
									//console.log(this.time()+"***"+this.NextBuff.current());							
							});
						});
					});
					
				}
				}		
			};			
			model_process.prototype.draw = function(){
					var w = 60;
					var h = 30;
					var l = 20;
					context.beginPath();
					context.lineWidth = 5;
					context.strokeStyle = this.color;
					context.fillStyle = this.color;					
					context.fillRect(this.x-w/2, this.y-h/2, w, h);
					context.moveTo(this.x-w/2, this.y);
					context.lineTo(this.x-w/2-l, this.y);
					context.moveTo(this.x+w/2, this.y);
					context.lineTo(this.x+w/2+l, this.y);
					context.closePath();
					context.fillStyle = "black";	
					context.font = 'italic 12pt Calibri';
					context.fillText(this.id,this.x-w/2.3,this.y+h/4.5);
					context.fill();
					context.stroke();
				};
			model_process.prototype.move = function(){
					this.x=mouse.x;
					this.y=mouse.y;
				};	
			//Модель:буфер деталей	
			var model_buff = function (x,y,color,id,bufsize){
				this.x=x;
				this.y=y;
				this.color=color;
				this.id=id || 'buff 0';
				this.selected=false;
				this.bufsize=bufsize || 10;
			};		
			model_buff.prototype.draw = function(){
					var w = 60;
					var h = 30;
					var l = 20;
					context.beginPath();
					context.lineWidth = 5;
					context.strokeStyle = this.color;
					context.fillStyle = this.color;					
					context.fillRect(this.x-w/2, this.y-h/2, w, h);
					context.moveTo(this.x-w/2, this.y);
					context.lineTo(this.x-w/2-l, this.y);
					context.moveTo(this.x+w/2, this.y);
					context.lineTo(this.x+w/2+l, this.y);
					context.closePath();
					context.fillStyle = "black";	
					context.font = 'italic 12pt Calibri';
					context.fillText(this.id,this.x-w/2.3,this.y+h/4.5);
					context.fill();
					context.stroke();
				};
			model_buff.prototype.move = function(){
					this.x=mouse.x;
					this.y=mouse.y;
				};
			//Модель:транспортировка деталей
			var model_trans = function (x,y,color,id,Tmin,Tmax,PrevBuff,NextBuff){
				this.x=x;
				this.y=y;
				this.color=color;
				this.id=id || 'trans 0';
				this.selected=false;
				this.SumTime=[0];
				this.Tmin=Tmin || 5;
				this.Tmax=Tmax || 7;
				this.PrevBuff=PrevBuff;
				this.NextBuff=NextBuff;
				
				this.start=function () {					
					if(this.NextBuff.current()!=this.NextBuff.size()){						
							//Взять поступившую деталь в обработку
							this.getBuffer(this.PrevBuff, 1).done(function () {
								// Следующая деталь будет обрабатываться в пределах интервала от времени от Tmin до Tmax
								var serviceTime = rand.uniform(this.Tmin, this.Tmax);
								console.log(this.time()+"***"+this.PrevBuff.current()+"***"+this.NextBuff.current());
								// Время ожидания при выполнении операции
								this.setTimer(serviceTime).done(function () {
									// Передать деталь на следующую операцию
									this.putBuffer(this.NextBuff, 1).done(function () {
									this.SumTime[0]+=serviceTime;
									this.start();
							});								
						});
					});
					
				}
				}	
			};			
			model_trans.prototype.draw = function(){
					var w = 60;
					var h = 30;
					var l = 20;
					context.beginPath();
					context.lineWidth = 5;
					context.strokeStyle = this.color;
					context.fillStyle = this.color;					
					context.fillRect(this.x-w/2, this.y-h/2, w, h);
					context.moveTo(this.x-w/2, this.y);
					context.lineTo(this.x-w/2-l, this.y);
					context.moveTo(this.x+w/2, this.y);
					context.lineTo(this.x+w/2+l, this.y);
					context.closePath();
					context.fillStyle = "black";	
					context.font = 'italic 12pt Calibri';
					context.fillText(this.id,this.x-w/2.3,this.y+h/4.5);
					context.fill();
					context.stroke();
				};
			model_trans.prototype.move = function(){
					this.x=mouse.x;
					this.y=mouse.y;
				};
			//Линии соединения моделей
			var connect_line = function (x0,y0,xn,yn,color,id0,idn){
				this.x0=x0;
				this.y0=y0;
				this.xn=xn;
				this.yn=yn;
				this.color=color;				
				this.selected=false;
				this.id0=id0;
				this.idn=idn;
			};			
			connect_line.prototype.draw = function(){					
					context.beginPath();
					context.lineWidth = 5;
					context.strokeStyle = this.color;
					context.moveTo(this.x0+50, this.y0);
					context.lineTo(this.xn-50, this.yn);
					context.closePath();
					context.stroke();
				};
			connect_line.prototype.move = function(){
					this.xn=mouse.x+50;
					this.yn=mouse.y;
				};
			//Модель:монтаж деталей
			var model_combination = function (x,y,color,id,Tmin,Tmax,PrevBuff1,PrevBuff2,NextBuff){
				this.x=x;
				this.y=y;
				this.color=color;
				this.id=id || 'comb 0';
				this.selected=false;
				this.SumTime=[0];
				this.Tmin=Tmin || 5;
				this.Tmax=Tmax || 7;
				this.PrevBuff1=PrevBuff1;
				this.PrevBuff2=PrevBuff2;
				this.NextBuff=NextBuff;
				
				this.start=function () {					
					if(this.NextBuff.current()!=this.NextBuff.size()){						
							//Взять поступившую деталь 1 в обработку
							this.getBuffer(this.PrevBuff1, 1).done(function () {
								//Взять поступившую деталь 2 в обработку
								this.getBuffer(this.PrevBuff2, 1).done(function () {
								// Следующая деталь будет обрабатываться в пределах интервала от времени от Tmin до Tmax
								var serviceTime = rand.uniform(this.Tmin, this.Tmax);
								//console.log(this.time()+"***"+this.PrevBuff1.current()+"***"+this.PrevBuff2.current());
								// Время ожидания при выполнении операции
								this.setTimer(serviceTime).done(function () {
									// Передать деталь на следующую операцию
									this.putBuffer(this.NextBuff, 1).done(function () {
									this.SumTime[0]+=serviceTime;
									this.start();
							});	
							});	
						});
					});
					
				}
				}	
			};			
			model_combination.prototype.draw = function(){
					var w = 60;
					var h = 30;
					var l = 20;
					context.beginPath();
					context.lineWidth = 5;
					context.strokeStyle = this.color;
					context.fillStyle = this.color;					
					context.fillRect(this.x-w/2, this.y-h/2, w, h);
					context.moveTo(this.x-w/2, this.y+h/3);
					context.lineTo(this.x-w/2-l, this.y+h/3);					
					context.moveTo(this.x-w/2, this.y-h/3);
					context.lineTo(this.x-w/2-l, this.y-h/3);
					context.moveTo(this.x+w/2, this.y);
					context.lineTo(this.x+w/2+l, this.y);
					context.closePath();
					context.fillStyle = "black";	
					context.font = 'italic 12pt Calibri';
					context.fillText(this.id,this.x-w/2.3,this.y+h/4.5);
					context.fill();
					context.stroke();
				};
			model_combination.prototype.move = function(){
					this.x=mouse.x;
					this.y=mouse.y;
				};
			//Модель:деструктор деталей
			var model_separation = function (x,y,color,id,Tmin,Tmax,PrevBuff,NextBuff1,NextBuff2){
				this.x=x;
				this.y=y;
				this.color=color;
				this.id=id || 'sep 0';
				this.selected=false;
				this.SumTime=[0];
				this.Tmin=Tmin || 5;
				this.Tmax=Tmax || 7;
				this.PrevBuff=PrevBuff;
				this.NextBuff1=NextBuff1;
				this.NextBuff2=NextBuff2;
				
				this.start=function () {					
					if(this.NextBuff1.current()!=this.NextBuff1.size() || this.NextBuff2.current()!=this.NextBuff2.size()){						
							//Взять поступившую деталь в обработку
							this.getBuffer(this.PrevBuff, 1).done(function () {
								// Следующая деталь будет обрабатываться в пределах интервала от времени от Tmin до Tmax
								var serviceTime = rand.uniform(this.Tmin, this.Tmax);
								//console.log(this.time()+"***"+this.PrevBuff.current()+"***"+this.NextBuff.current());
								// Время ожидания при выполнении операции
								this.setTimer(serviceTime).done(function () {
									// Передать деталь на следующую операцию
									this.putBuffer(this.NextBuff1, 1);
									this.putBuffer(this.NextBuff2, 1);
									this.SumTime[0]+=serviceTime;
									this.start();	
						});
					});
					
				}
				}	
			};			
			model_separation.prototype.draw = function(){
					var w = 60;
					var h = 30;
					var l = 20;
					context.beginPath();
					context.lineWidth = 5;
					context.strokeStyle = this.color;
					context.fillStyle = this.color;					
					context.fillRect(this.x-w/2, this.y-h/2, w, h);
					context.moveTo(this.x-w/2, this.y);
					context.lineTo(this.x-w/2-l, this.y);
					context.moveTo(this.x+w/2, this.y-h/3);
					context.lineTo(this.x+w/2+l, this.y-h/3);
					context.moveTo(this.x+w/2, this.y+h/3);
					context.lineTo(this.x+w/2+l, this.y+h/3);
					context.closePath();
					context.fillStyle = "black";	
					context.font = 'italic 12pt Calibri';
					context.fillText(this.id,this.x-w/2.3,this.y+h/4.5);
					context.fill();
					context.stroke();
				};
			model_separation.prototype.move = function(){
					this.x=mouse.x;
					this.y=mouse.y;
				};
		
					
			var g = new model_generation(60,25,"fuchsia");	
			var p = new model_process(60,75,"lime");
			var b = new model_buff(60,125,"red");
			var t = new model_trans(60,175,"aqua");
			var c = new model_combination(60,225,"yellow");
			var s = new model_separation(60,275,"orange");
			
			//Графический интерфейс приложения
			function show() {

			//Отображать Canvas
				if (document.getElementById('field').style.display == "none"){
						document.oncontextmenu = new Function ("return false");
						document.getElementById('field').style.display = "block";
					} else { 
					document.getElementById('field').style.display = "none";
					document.oncontextmenu = new Function ("return true");
					};
			//Анимация объектов						
				setInterval(function(){
					clear();
					bar();
					p.draw();
					b.draw();
					t.draw();
					g.draw();
					c.draw();
					s.draw();
					
					var i;
					for (i in objs) {
						for (var j=0; j<objs[i].length; j++){
							objs[i][j].draw();
							for (var n=0; n<line.length; n++){								
								line[n].draw();
								if (line[n].selected){
									line[n].move();									
									if (isCursorOnTemp(mouse.x,mouse.y,objs[i][j]) && objs[i]!=objs.gen){
										line[n].xn=objs[i][j].x;
										line[n].yn=objs[i][j].y;
										line[n].idn=objs[i][j].id;
										line[n].selected=false;
									}
								}						
							};
							
							if(mouse.down && objs[i][j].selected){
								objs[i][j].move();
								for (var n=0; n<line.length; n++){
									if(line[n].id0==objs[i][j].id){
										line[n].x0=objs[i][j].x;
										line[n].y0=objs[i][j].y;
									} else if (line[n].idn==objs[i][j].id){
										line[n].xn=objs[i][j].x;
										line[n].yn=objs[i][j].y;
										}									
												
								};
							}
						};
					};					
				}, 1000/60);
            };
			
			
			//Выполнение расчетов
			function simulation (){				
				var TimeOfSim = document.getElementById("SimTime").value; // Время симуляции	
					if(objs.gen[0].id==line[0].id0 && line[0]!=undefined){
						var i,counter=0;
						//Выставляем соответствие для gen(id0), далее сравнение выполняется для line.idn
						objs.gen[0].NextBuff=buffer[counter];
						sim.addEntity(objs.gen[0]);
						for (var k=0; k<line.length; k++){
							for (i in objs) {
								for (var j=0; j<objs[i].length; j++){
									if (objs[i][j].id==line[k].idn) {
										//Выставляем емкость буфера sim
										if (objs[i]==objs.buff){
											buffer[counter].capacity=objs.buff[j].bufsize;
											//console.log(objs.buff[j].id+"///"+counter);											
												
										} else {										
											objs[i][j].PrevBuff=buffer[counter];
											objs[i][j].NextBuff=buffer[counter+1];
											sim.addEntity(objs[i][j]);
											counter++;
										};
										/*console.log(objs[i][j].id);
										console.log(buffer.length);*/
									};		
								};	
							};	
						};				
					} else console.log("создай объект gen");					
				sim.simulate(TimeOfSim); //Запустить симуляцию
				
				//Отрисовка диаграммы
				var ArrTemp=line.slice();
				var ElemCount=buffer.length;
				DetailChart[0][0]=ArrTemp[0].id0;		
				
				for (var n=0; n<ArrTemp.length; n++){
					for (var s=0; s<objs.buff.length; s++){					
						if (ArrTemp[n].idn==objs.buff[s].id) {						
							ArrTemp.splice(n,1);
							if	(n==ArrTemp.length){
							//Появился лишний элемент, если последний в цепочке buff
								ElemCount--;	
							}
						};
					};
				};	
				//Название элемента
				for (var w=0; w<ArrTemp.length; w++){
					DetailChart.push(new Array(ArrTemp[w].idn));
				};
				//Количество обработанных деталей элементом
				for (var m=0; m<ElemCount; m++){
					DetailChart[m][1]=buffer[m].putQueue.stats.durationSeries.count();
					//console.log(buffer.length+'после '+DetailChart[m][0]+' '+DetailChart[m][1]);
					};
				//Построить диаграмму		
				Chart.setDataArray(DetailChart);
				Chart.draw();
				//Построить график				
				TimeData.splice(TimeData.length-1,1);
				for (var m=0; m<TimeData.length; m++){
				console.log(TimeData[m][0]+"---"+TimeData[m][1]);
				}				
				LineChart.setDataArray(TimeData);
				LineChart.draw();
				//Построить таблицу
				tab = document.createElement('table');
				r1 = tab.insertRow(0);
				r2 = tab.insertRow(0);
				r3 = tab.insertRow(0);				
				r1.insertCell(0).innerHTML = "Total time";
				r2.insertCell(0).innerHTML = "Average time";
				r3.insertCell(0).innerHTML = "Model"; 
				r1.insertCell(1).innerHTML = objs.gen[0].SumTime[0].toFixed(3);
				r2.insertCell(1).innerHTML = (objs.gen[0].SumTime[0]/buffer[0].putQueue.stats.durationSeries.count()).toFixed(3);
				r3.insertCell(1).innerHTML = line[0].id0;
				var icount, jcount=0;				
				for (var k=0; k<line.length; k++){
					for (icount in objs) {						
						for (var j=0; j<objs[icount].length; j++){
							if (objs[icount][j].id==line[k].idn) {
								if (objs[icount]!=objs.buff){									
									r1.insertCell(jcount+2).innerHTML = objs[icount][j].SumTime[0].toFixed(3);
									r2.insertCell(jcount+2).innerHTML = (objs[icount][j].SumTime[0]/buffer[jcount+1].putQueue.stats.durationSeries.count()).toFixed(3);
									r3.insertCell(jcount+2).innerHTML = line[k].idn;
									jcount++;
								};
							};
						};
					};
				};
				document.getElementById("table1").appendChild(tab);				
			};
			
			function applymean(){
				var i;
				for (i in objs) {
					for (var j=0; j<objs[i].length; j++){
						if (temp==objs[i][j].id){
							objs[i][j].Tmin= parseInt(document.getElementById("Tmin").value);
							objs[i][j].Tmax= parseInt(document.getElementById("Tmax").value);
							console.log(objs[i][j].Tmin+"---"+objs[i][j].Tmax);
						}		
					};
				};										
			};
			
			function applybuff(){
				
					for (var j=0; j<objs.buff.length; j++){
						if (temp==objs.buff[j].id){
							objs.buff[j].bufsize= parseInt(document.getElementById("Buff").value);							
							console.log(objs.buff[j].bufsize+'---'+objs.buff[j].id);
						}		
					};
				};										
			
			function isCursorOnTemp(x,y,t) {
				return x < t.x + 30 && x > t.x - 30 && y < t.y + 15 && y > t.y - 15;
				};
				
			function DrawlineConnect(x,y,t) {
				return x < t.x + 50 && x > t.x + 35 && y < t.y + 8 && y > t.y - 8;
				};	
			
			function clear() {
				context.clearRect(0, 0, canvas.width, canvas.height);
				};

			function bar(){			
				context.beginPath();
				context.fillStyle = "white";
				context.lineWidth = 1;
				context.strokeStyle = "black";
				context.fillRect(1, 1, 120, 598);
				context.moveTo(120, 0);
				context.lineTo(120, 598);
				context.moveTo(120, 300);
				context.lineTo(0, 300);
				context.moveTo(120, 400);
				context.lineTo(0, 400);
				context.closePath();
				context.fill();
				context.stroke();
			};
			
			canvas.onmousemove = function (event) {				
				mouse.x =event.pageX-canvas.getBoundingClientRect().left;
				mouse.y =event.pageY-canvas.getBoundingClientRect().top;
				
			};	
			
			canvas.onmousedown = function (event) {				
			if(event.button == 0) {
				mouse.down = true;
				if (isCursorOnTemp(mouse.x,mouse.y,p)){						
						objs.process.push(new model_process(mouse.x, mouse.y, "lime",('proc '+(objs.process.length+1))));						
					} else if (isCursorOnTemp(mouse.x,mouse.y,b)) {
						objs.buff.push(new model_buff(mouse.x, mouse.y, "red",('buff '+(objs.buff.length+1))));						
					} else if (isCursorOnTemp(mouse.x,mouse.y,t)) {						
						objs.trans.push(new model_trans(mouse.x, mouse.y, "aqua",('trans '+(objs.trans.length+1))));
					} else if (isCursorOnTemp(mouse.x,mouse.y,g)) {						
						objs.gen.push(new model_generation(mouse.x, mouse.y, "fuchsia",('gen '+(objs.gen.length+1))));
					} else if (isCursorOnTemp(mouse.x,mouse.y,c)) {						
						objs.comb.push(new model_combination(mouse.x, mouse.y, "yellow",('comb '+(objs.comb.length+1))));
					} else if (isCursorOnTemp(mouse.x,mouse.y,s)) {						
						objs.sep.push(new model_separation(mouse.x, mouse.y, "orange",('sep '+(objs.sep.length+1))));	
					};
				
			var i,u=false;
			for (i in objs) {
				for (var j=0; j<objs[i].length; j++){	
					if (isCursorOnTemp(mouse.x,mouse.y,objs[i][j])){			
						objs[i][j].selected=true;
						u=true;
						break;
					};					
				};
				if(u)break;
			}
			
			var f;
			for (f in objs) {
				for (var k=0; k<objs[f].length; k++){	
					if (DrawlineConnect(mouse.x,mouse.y,objs[f][k])){						
						line.push(new connect_line(objs[f][k].x, objs[f][k].y, objs[f][k].x,objs[f][k].y, objs[f][k].color, objs[f][k].id));
						line[line.length-1].selected=true;
						//Элемент buff изменяет емкость sim.buff
						if (objs[f]!=objs.buff){
						buffer.push(new Sim.Buffer("buffer"+(buffer.length+1), 1));	
						}					
					};					
				};			
			}
			}
			if(event.button == 2) {
			//Меню для корректировки параметров элементов модели
			var y,z;
			for (y in objs) {
				for (var u=0; u<objs[y].length; u++){	
					if (isCursorOnTemp(mouse.x,mouse.y,objs[y][u])){
						if (objs[y]!=objs.buff){
							if (document.getElementById('dataT').style.display == "none"){						
								document.getElementById('dataT').style.display = "block";
								document.getElementById('dataT').style.top = (objs[y][u].y-690)+"px";
								document.getElementById('dataT').style.left = (objs[y][u].x-50)+"px";
								temp=objs[y][u].id;
							} else document.getElementById('dataT').style.display = "none";
						
						} else {
							if (document.getElementById('dataB').style.display == "none"){						
							document.getElementById('dataB').style.display = "block";
							document.getElementById('dataB').style.top = (objs[y][u].y-690)+"px";
							document.getElementById('dataB').style.left = (objs[y][u].x-50)+"px";
							temp=objs[y][u].id;
							} else document.getElementById('dataB').style.display = "none";								
						}
						z=true;
						break;
					};					
				};
				if(z)break;
				}			
			};
			};	
			
			canvas.onmouseup = function (event) {
			if(event.button == 0) {	
				mouse.down = false;
				var i;
				for (i in objs) {
					for (var j=0; j<objs[i].length; j++){									
						objs[i][j].selected=false;
					};				
				}
			}	
			};
