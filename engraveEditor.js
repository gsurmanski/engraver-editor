var canvas;
var a;
var b;
var line1;
var line2;
var line3;
var line4;
 	$(document).ready(function() {
		//setup front side canvas 
 		canvas = new fabric.Canvas('tcanvas', {
		  hoverCursor: 'pointer',
		  selection: false,
		  isDrawingMode: false,
		  selectionBorderColor:'blue'
		});
 		canvas.on({
			 'object:moving': function(e) {		  	
			    e.target.opacity = 0.5;
			  },
			  'object:modified': function(e) {		  	
			    e.target.opacity = 1;
			  },
			 'selection:created':onObjectSelected,
			 'selection:updated':onObjectSelected,
			 'selection:cleared':onSelectedCleared
		 });
		// piggyback on `canvas.findTarget`, to fire "object:over" and "object:out" events
 		canvas.findTarget = (function(originalFn) {
		  return function() {
		    var target = originalFn.apply(this, arguments);
		    if (target) {
		      if (this._hoveredTarget !== target) {
		    	  canvas.fire('object:over', { target: target });
		        if (this._hoveredTarget) {
		        	canvas.fire('object:out', { target: this._hoveredTarget });
		        }
		        this._hoveredTarget = target;
		      }
		    }
		    else if (this._hoveredTarget) {
		    	canvas.fire('object:out', { target: this._hoveredTarget });
		      this._hoveredTarget = null;
		    }
		    return target;
		  };
		})(canvas.findTarget);

 		canvas.on('object:over', function(e) {		
		  //e.target.setFill('red');
		  //canvas.renderAll();
		});
		
 		canvas.on('object:out', function(e) {		
		  //e.target.setFill('green');
		  //canvas.renderAll();
		});

		// snap gridlines///////////////////////////////////////////////////////////////////
		linev = new fabric.Line([
			canvas.width / 2, 0,
			canvas.width / 2, canvas.height
		], {
			strokeDashArray: [5, 5],
			stroke: 'red',
		})
		
		linev.selectable = false;
		linev.evented = false;
		
		lineh = new fabric.Line([
			0, canvas.height / 2,
			canvas.width, canvas.height / 2
		], {
			strokeDashArray: [5, 5],
			stroke: 'red',
			strokeWidth: 1,
		})
		
		lineh.selectable = false;
		lineh.evented = false;
		
		var snapZone = 15;

		canvas.on('object:moving', function(event) {
			
			var obj = event.target;
			var obj_center = obj.getCenterPoint();
		//added logic so if obj center is already centered, don't activate (for android when trying to click edit itext. dotted line was interfereing)
			if (obj_center.x > canvas.width / 2 - snapZone &&
				obj_center.x < canvas.width / 2 + snapZone && obj_center.x !== canvas.width / 2) {
					

				obj_center.setX(canvas.width / 2);
				obj.setPositionByOrigin(obj_center);
		
				canvas.add(linev);
		
				document.addEventListener("mouseup", () => {
					canvas.remove(linev);
				});
				//set timeout for mobile to remove lines
				setTimeout(function() { 
					canvas.remove(linev);
				}, 1500);
		
			} else {
				canvas.remove(linev);
			}
		//added logic so if obj center is already centered, don't activate
			if (obj_center.y > canvas.height / 2 - snapZone &&
				obj_center.y < canvas.height / 2 + snapZone && obj_center.y !== canvas.height / 2) {
				obj_center.setY(canvas.height / 2);
				obj.setPositionByOrigin(obj_center);
		
				canvas.add(lineh);
		
				document.addEventListener("mouseup", () => {
					canvas.remove(lineh);
				});
				//set timeout for mobile to remove lines
				setTimeout(function() { 
					canvas.remove(lineh);
				}, 1500);
			} else {
				canvas.remove(lineh);
			}
		});
		///////////////////////////////////////////////////////////////////////

		////////////////////////////////////////////////////////////////////////
		//make it so enter key just deselects text box
		fabric.IText.prototype.onKeyDown = (function(onKeyDown) {
			return function(e) {
			  if (e.keyCode == 13){
				canvas.discardActiveObject().renderAll();
			 
			}
			}
		  })(fabric.IText.prototype.onKeyDown)
/////////////////////////////////////////////////////////////

		//add text on click
		$('#add-text').on('click',function() { engravetext(); });
////////////////////////////////////////////////////////////
		
		function engravetext() {
			
			var text = "Your Text..."
		    var textSample = new fabric.IText(text, {
		      left: fabric.util.getRandomInt(0, 20),
		      top: 100,
		      angle: 0,
		      fill: '#000000',
			  fontSize: 40,
		      fontWeight: '',
	  		  hasRotatingPoint:true,
				borderColor: 'gray',
				cornerColor: 'black'
		    });		   

            canvas.add(textSample);	
			// load all noto fonts for usage
			loadAndUse('Noto Sans');

			canvas.setActiveObject(textSample);
			//enter editing
			textSample.selectAll();
			textSample.enterEditing();

            canvas.item(canvas.item.length-1).hasRotatingPoint = true;    
            $("#texteditor").css('display', 'block');
			//show font selector for adding text
			$('#font-family').show();
			$('#text-italic').show();
			$('#text-bold').show();
			//remove text strike and underline for now
			$('#text-strike').hide();
			$('#text-underline').hide();

			//change text changer back to Roboto if different
			document.getElementById('font-family').value= "Noto Sans";

            $("#imageeditor").css('display', 'block');
	  	};

		//////////////////////////////////////////////////////
//add emoji ***********************************************
$(".emojibutton").click(function(){

			var text = $(this).html();

		    var textSample = new fabric.Text(text, {
		      left: fabric.util.getRandomInt(0, 100),
		      top: fabric.util.getRandomInt(0, 100),
		      fontFamily: 'Noto Emoji',
		      angle: 0,
		      fill: '#000000',
			  fontSize: 90,
		      fontWeight: '',
	  		  hasRotatingPoint:true,
				borderColor: 'gray',
				cornerColor: 'black'
		    });		    

			
            canvas.add(textSample);	
			canvas.setActiveObject(textSample);
            canvas.item(canvas.item.length-1).hasRotatingPoint = true;    
            $("#texteditor").css('display', 'block');
			//hide font choices, italic, and text decoration for emojis
			$('#font-family').hide();
			$('#text-italic').hide();
			$('#text-strike').hide();
			$('#text-underline').hide();
			$('#text-bold').show();

            $("#imageeditor").css('display', 'block');
	  	
	});
// end function *****************************************

//add search emoji ***********************************************
$("#searchresult").on("click", ".emojibutton", function(){
			
	var text = $(this).html();

	var textSample = new fabric.Text(text, {
	  left: fabric.util.getRandomInt(0, 100),
	  top: fabric.util.getRandomInt(0, 100),
	  fontFamily: 'Noto Emoji',
	  angle: 0,
	  fill: '#000000',
	  fontSize: 90,
	  fontWeight: '',
		hasRotatingPoint:true,
		borderColor: 'gray',
		cornerColor: 'black'
	});		    

	
	canvas.add(textSample);	
	canvas.setActiveObject(textSample);
	canvas.item(canvas.item.length-1).hasRotatingPoint = true;    
	$("#texteditor").css('display', 'block');

	//hide font choices for emojis
	$('#font-family').hide();
	$('#text-italic').hide();
	$('#text-strike').hide();
	$('#text-underline').hide();
	$('#text-bold').show();

	$("#imageeditor").css('display', 'block');
  
});
// end function *****************************************

		  
	  document.getElementById('remove-selected').onclick = function() {		  
        var selected = canvas.getActiveObjects(),
            selGroup = new fabric.ActiveSelection(selected, {
                canvas: canvas
            });
        if (selGroup) {

                selGroup.forEachObject(function (obj) {
                    canvas.remove(obj);
                });
            
        } else {
            return false;
        }
        // Use discardActiveObject to remove the selection border
        canvas.discardActiveObject().renderAll();
	  };


   //updated functions for style setting taken from http://fabricjs.com/js/kitchensink/controller.js applied to line through and underline because textdecoration property removed from fabric

   function getActiveStyle(styleName, object) {
    object = object || canvas.getActiveObject();
    if (!object) return '';
  
    return (object.getSelectionStyles && object.isEditing)
      ? (object.getSelectionStyles()[styleName] || '')
      : (object[styleName] || '');
  };
  
  function setActiveStyle(styleName, value, object) {
    object = object || canvas.getActiveObject();
    if (!object) return;
  
    if (object.setSelectionStyles && object.isEditing) {
      var style = { };
      style[styleName] = value;
      object.setSelectionStyles(style);
      object.setCoords();
    }
    else {
      object.set(styleName, value);
    }
  
    object.setCoords();
    canvas.requestRenderAll();
  };
  /////////////////////////////////////////////////////////////////////

  //old functions
  $("#text-bold").click(function() {		  
		  var activeObject = canvas.getActiveObject();
		  if (activeObject && activeObject.type === 'i-text' || activeObject.type === 'text') {
		    activeObject.fontWeight = (activeObject.fontWeight == 'bold' ? '' : 'bold');		    
		    canvas.renderAll();
		  }
		});

	  $("#text-italic").click(function() {		 
		  var activeObject = canvas.getActiveObject();
		  if (activeObject && activeObject.type === 'i-text') {
			  activeObject.fontStyle = (activeObject.fontStyle == 'italic' ? '' : 'italic');		    
		    canvas.renderAll();
		  }
		});

        isLinethrough = function() {
            return getActiveStyle('textDecoration').indexOf('line-through') > -1 || getActiveStyle('linethrough');
          };
	  $("#text-strike").click(function() {		  
		  var activeObject = canvas.getActiveObject();
		  if (activeObject && activeObject.type === 'text') {
            var value = isLinethrough()
            ? getActiveStyle('textDecoration').replace('line-through', '')
            : (getActiveStyle('textDecoration') + ' line-through');
      
          setActiveStyle('textDecoration', value);
          setActiveStyle('linethrough', !getActiveStyle('linethrough'));
		    canvas.renderAll();
		  }
		});
//new function for determining underline
isUnderline = function() {
    return getActiveStyle('textDecoration').indexOf('underline') > -1 || getActiveStyle('underline');
  };
          //
	  $("#text-underline").click(function() {		  
		  var activeObject = canvas.getActiveObject();

		  if (activeObject && activeObject.type === 'text') {
            var value = isUnderline()
            ? getActiveStyle('textDecoration').replace('underline', '')
            : (getActiveStyle('textDecoration') + ' underline');
      
          setActiveStyle('textDecoration', value);
          setActiveStyle('underline', !getActiveStyle('underline'));
		    canvas.renderAll();
		  }
		});
	  $("#text-left").click(function() {		  
		  var activeObject = canvas.getActiveObject();
		  if (activeObject && activeObject.type === 'text') {
			  activeObject.textAlign = 'left';
		    canvas.renderAll();
		  }
		});
	  $("#text-center").click(function() {		  
		  var activeObject = canvas.getActiveObject();
		  if (activeObject && activeObject.type === 'text') {
			  activeObject.textAlign = 'center';		    
		    canvas.renderAll();
		  }
		});
	  $("#text-right").click(function() {		  
		  var activeObject = canvas.getActiveObject();
		  if (activeObject && activeObject.type === 'text') {
			  activeObject.textAlign = 'right';		    
		    canvas.renderAll();
		  }
		});	  
//FONT HANDLING//////////////////
		// Load all fonts using Font Face Observer
		var fonts = ["Open Sans", "Montserrat", "Poppins", "Roboto", "Cabin", "Lato", "Merriweather", "Nunito", "Rokkitt"];
		var handfont = ["Pacifico", "Caveat", "Permanent Marker", "Lugrasimo", "Dancing Script", "Fondamento"];

		fonts.unshift('Noto Sans');

		// Populate the reg fontFamily select
		var select = document.getElementById("font-family");
		fonts.forEach(function(font) {
		  var option = document.createElement('option');
		  option.innerHTML = font;
		  option.value = font;
		  select.appendChild(option);
		});

			// Populate the handwritten fontFamily select
			handfont.forEach(function(handfont) {
			  var option = document.createElement('option');
			  option.innerHTML = handfont;
			  option.value = handfont;
			  select.appendChild(option);
			});
		
		// Apply selected font on change
		document.getElementById('font-family').onchange = function() {

		  if (this.value !== 'Noto Sans') {
			loadAndUse(this.value);
			//if handwritten font (in handfont array), remove bold and italic options
				if (handfont.includes(this.value)){
				$('#text-italic').hide();
				$('#text-bold').hide();
				//remove font styles if handwritten font
				canvas.getActiveObject().set("fontStyle", 'normal');
				canvas.getActiveObject().set("fontWeight", 'normal');
				canvas.renderAll();
			 	 }
				 else {
					// add bold and italic
				$('#text-italic').show();
				$('#text-bold').show();
				 }
		  } else {
			canvas.getActiveObject().set("fontFamily", this.value);
			canvas.requestRenderAll();
			$('#text-italic').show();
				$('#text-bold').show();
		  }
		};
		//load fonts
		function loadAndUse(font) {
			// load all font variations
			  
			  var font1 = new FontFaceObserver(font, {
				weight: 700,
				style: 'italic'
			  });
			  font1.load()

			  var font2 = new FontFaceObserver(font, {
				style: 'italic'
			  });
			  font2.load()

			  var font3 = new FontFaceObserver(font, {
				weight: 700
			  });
			  font3.load()

		  var myfont1 = new FontFaceObserver(font)
		  myfont1.load()
			.then(function() {
			  // when font is loaded, use it.
			  canvas.getActiveObject().set("fontFamily", font);
			  canvas.requestRenderAll();
			}).catch(function(e) {
			  console.log(e)
			  alert('font loading failed ' + font);
			});
		} 
//////////////////////////////////////////////		

		//canvas.add(new fabric.fabric.Object({hasBorders:true,hasControls:false,hasRotatingPoint:false,selectable:false,type:'rect'}));
	   $("#drawingArea").hover(
	        function() { 	        	
	        	 canvas.add(line1);
		         canvas.add(line2);
		         canvas.add(line3);
		         canvas.add(line4); 
		         canvas.renderAll();
	        },
	        function() {	        	
	        	 canvas.remove(line1);
		         canvas.remove(line2);
		         canvas.remove(line3);
		         canvas.remove(line4);
		         canvas.renderAll();
	        }
	    );


	   $(".clearfix button,a").tooltip();
	   line1 = new fabric.Line([0,0,240,0], {"stroke":"#000000", "strokeWidth":1,hasBorders:false,hasControls:false,hasRotatingPoint:false,selectable:false});
	   line2 = new fabric.Line([239,0,240,499], {"stroke":"#000000", "strokeWidth":1,hasBorders:false,hasControls:false,hasRotatingPoint:false,selectable:false});
	   line3 = new fabric.Line([0,0,0,240], {"stroke":"#000000", "strokeWidth":1,hasBorders:false,hasControls:false,hasRotatingPoint:false,selectable:false});
	   line4 = new fabric.Line([0,239,240,239], {"stroke":"#000000", "strokeWidth":1,hasBorders:false,hasControls:false,hasRotatingPoint:false,selectable:false});
	 
	   function getRandomNum(min, max) {
	    return Math.random() * (max - min) + min;
	 }

	 //when object is selected and highlighted///////////////////
	 function onObjectSelected(e) {	

	    var selectedObject = canvas.getActiveObject();

	    selectedObject.hasRotatingPoint = true

		//if not handfont
	    if (selectedObject && selectedObject.type === 'i-text' && selectedObject.fontFamily !== 'Noto Emoji' && handfont.includes(selectedObject.fontFamily)==false) {
			//set font family value
			let element = document.getElementById('font-family');
			element.value = selectedObject.fontFamily;

			//display text editor	    	
	    	$("#texteditor").css('display', 'block');
			//show font selector for adding text
			$('#font-family').show();
			$('#text-italic').show();
			   	
	
	    	$("#imageeditor").css('display', 'block');
	    }
		else if(selectedObject && selectedObject.type == 'path'){
			//do not show font options for path
			$("#texteditor").css('display', 'block');

			//hide font choices for path
			$('#font-family').hide();
			$('#text-italic').hide();
			$('#text-bold').hide();
			$('#text-strike').hide();
			$('#text-underline').hide();
	  	
	
	    	$("#imageeditor").css('display', 'block');
		}
		else if(selectedObject && selectedObject.type === 'text' && selectedObject.fontFamily == 'Noto Emoji'){
			//do not show font options if emoji because it messes emoji up
			$("#texteditor").css('display', 'block');

			//hide font choices for emojis
			$('#font-family').hide();
			$('#text-italic').hide();
			$('#text-strike').hide();
			$('#text-underline').hide();
	 	
	
	    	$("#imageeditor").css('display', 'block');
		}
		else {
			//text is handwritten font
				//set font family value
				let element = document.getElementById('font-family');
				element.value = selectedObject.fontFamily;
				
			$('#font-family').show();
			$('#text-italic').hide();
			$('#text-strike').hide();
			$('#text-underline').hide();
			$("#imageeditor").css('display', 'block');
			$("#texteditor").css('display', 'block');
		}
	  }

	 function onSelectedCleared(e){
		 $("#texteditor").css('display', 'none');
		 $("#imageeditor").css('display', 'none');
	 }

	 function setFont(font){
		  var activeObject = canvas.getActiveObject();
	      if (activeObject && activeObject.type === 'text') {
	        activeObject.fontFamily = font;
	        canvas.renderAll();
	      }
	  }

	 function removeWhite(){
		  var activeObject = canvas.getActiveObject();
		  if (activeObject && activeObject.type === 'image') {			  
			  activeObject.filters[2] =  new fabric.Image.filters.RemoveWhite({hreshold: 100, distance: 10});//0-255, 0-255
			  activeObject.applyFilters(canvas.renderAll.bind(canvas));
		  }	        
	 }	
	
	
	});//doc ready
	 



	 //add drawing mode///////////////////////////////////////////////////////////
	 ////////////////////////////////////////////////////////////////////////////
	 
	
	var drawingOptionsEl = $('drawing-mode-options'),
	 drawingColorEl = $('drawing-color'),
	 drawingShadowColorEl = $('drawing-shadow-color'),
	 drawingLineWidthEl = $('drawing-line-width');

	 $('#drawing-mode').click(function(){
   canvas.isDrawingMode = !canvas.isDrawingMode;
   if (canvas.isDrawingMode) {
	//set drawing wifth default
	canvas.freeDrawingBrush.width=5;
	$('#drawing-mode').html('🚫');
	document.getElementById("drawing-mode-options").style.display = '';
   }
   else {
	$('#drawing-mode').html('✏️');
	document.getElementById("drawing-mode-options").style.display = 'none';
   }
});


function updateSlider(slideAmount) {
	var sliderDiv = document.getElementById("sliderAmount");
	sliderDiv.innerHTML = slideAmount;

   canvas.freeDrawingBrush.width = parseInt(slideAmount, 10) || 1;
}