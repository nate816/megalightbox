
    //************************************************************************
    //  USER OPTIONS
    const options = {
        'filePath' : "lightbox/", // directory path to your lightbox files
        'captions': true, // enable captions - true or false*
        // * use captions.json to edit captions
        'loadTime': 1000, // in milliseconds - minimum time period loader boxes 
        // are shown
        'rollover': "zoom", //thumbnail hover animation*
        //* zoom, slide, drop, or none.
        'slider': "slide" //lightbox slider animation*
        //* zoom, slide, or none.                   
    }

    Object.freeze(options);

    const { filePath, captions, loadTime, rollover, slider } = options;

    //************************************************************************

    var resizeDone, captionsLoaded = false, imgCount;
    var notLoaded = true;

    window.addEventListener('resize', () => {
        clearTimeout(resizeDone),
            resizeDone = setTimeout(() => {
                //check if element is visible
                if (window.getComputedStyle(document.querySelector(".lightbox")).getPropertyValue("display") != "none" ){
                    setNav();
                };
            }, 50);
    });

    //************************************************************************
    //          Load captions from captions.json ...
    //************************************************************************

    if(captions){
        //SHOW CAPTIONS LOADER...
        document.querySelector('.loader-captions').style.display = 'block';
        let xhr = new XMLHttpRequest();
        xhr.open('GET', filePath + 'captions.php');
        xhr.send();
        xhr.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                captionsLoaded = true;
            }
        };
    }

    //************************************************************************
    //          FORM IMAGE ARRAY FROM /fullsize/ FOLDER IMAGES
    //************************************************************************

    let xhr = new XMLHttpRequest();
    xhr.open('GET', filePath + 'full.php?filePath=' + filePath);
    xhr.send(); 
    xhr.onreadystatechange = function(e){
        if (this.readyState == 4 && this.status == 200) {
            imgArray = JSON.parse(e.currentTarget.response);
            imgCount = imgArray.length;
            for (x = 0; x <= imgCount - 1; x++) {
                //load dummy images into relative gallery div
                let gal = document.querySelector('#gallery');
                gal.insertAdjacentHTML('beforeend', '<div class="loader"><img src="' + filePath + 'images/image-dummy.png" class="fadeRight" alt=""/></div>');
            }
            thumbs();
        }
    };
    //************************************************************************
    //          LOAD THUMBNAIL GALLERY
    //************************************************************************
    function thumbs() {
        //hide loader boxes if visible
        if (window.getComputedStyle(document.querySelector(".loader-captions")).getPropertyValue("display") != "none" ){
            document.querySelector('.loader-captions').setAttribute('style', 'display:none');
        };
        try {
            let xhr = new XMLHttpRequest();
            xhr.open('GET', filePath + 'thumbs.php?filePath=' + filePath + '&imgCount=' + imgCount + '&fArray=' + imgArray);
            xhr.send(); 
            xhr.onreadystatechange = function(e){
                if (this.readyState == 4 && this.status == 200) {
                    thumbArray = JSON.parse(e.currentTarget.response);
                    let gal = document.getElementById('gallery');
                    for (x = 0; x <= thumbArray.length - 1; x++) {
                        gal.insertAdjacentHTML('beforeend', '<div class="thumb"><a href="#"><img src="' + thumbArray[x] + '" /></a></div>');
                    };
                    let thumbs = document.querySelectorAll(".thumb img");
                    // wait until last thumb is loaded...
                    let lastThumb; 
                    thumbs.forEach((el, index) => {
                        if(index == thumbs.length - 1){
                            lastThumb = thumbs[thumbs.length - 1];
                        }
                    })
                    if(typeof lastThumb === "undefined"){
                        alert('Looks like you uploaded new photos. Please clear the browser cache and you should be good to go.');
                        return;
                    };
                    //************************************
                    lastThumb.addEventListener("load", () => {
                        //********************************************
                        //          VERTICAL/BIG THUMB HANDLING 
                        //******************************************** 
                        for(let i of thumbs){
                            let real_width = i.naturalWidth;
                            let real_height = i.naturalHeight;
                            if (real_height > real_width) {
                                i.closest('div').classList.add("vertical");
                            };
                        };
                        //**************************************************   
                        //*** GET HEIGHT OF GALLERY */
                        let h = gal.clientHeight;
                        //**************************************************
                        setTimeout(function () { //show loaders
                            let thumbs = document.querySelectorAll('.thumb');
                            let delay = 30;
                            thumbs.forEach((element, index) => {
                                setTimeout(() => {
                                    element.style.display = 'block';
                                    element.classList.add("fadein");
                                }, delay*index);
                            });
                            let loaders = document.querySelectorAll('.loader');
                            loaders.forEach((element) => {
                                element.style.display = 'none';
                                element.classList.add("fadeout");
                            });
                            //set gallery height ...
                            gal.setAttribute('style', 'height:' + h + 'px');
                            //after loaders are gone, reset gallery height to auto ...
                            setTimeout(() => {
                                gal.setAttribute('style', 'height:auto');
                                notLoaded = false;  //enable gallery click event
                            }, delay*thumbs.length);
                            //********************************************
                            //          THUMBNAIL ROLLOVERS 
                            //********************************************
                            let imgs = document.querySelectorAll('.thumb img');
                            imgs.forEach(element => {
                                element.addEventListener("mouseenter", (event) => {
                                    if (rollover == "zoom") {
                                        event.target.classList.add('thumb-zoom');
                                    }
                                    else if (rollover == "slide") {
                                        event.target.classList.add('thumb-slide');
                                    }
                                    else if (rollover == "drop") {
                                        event.target.classList.add('thumb-drop');
                                    }
                                });
                                element.addEventListener("mouseleave", (event) => {
                                    if (rollover == "zoom") {
                                        event.target.classList.remove('thumb-zoom');
                                    }
                                    else if (rollover == "slide") {
                                        event.target.classList.remove('thumb-slide');
                                    }
                                    else if (rollover == "drop") {
                                        event.target.classList.remove('thumb-drop');
                                    } 
                                });                 
                            });
                        }, loadTime);
                    });
                };
            };
        } catch (err) {
            alert("something went wrong:  " + err.message);
            return;
        };
    };

    //************************************************************************
    //          SHOW INITIAL IMAGE
    //************************************************************************
    let gal = document.getElementById('gallery');
    gal.addEventListener('click', (e) => {
        let target = e.target;
        // if target is not the thumbnail image, get out to avoid typeError.
        if(target.getAttribute("src") == null){
            return;
        }
        if(notLoaded){ //enable only after all thumbs loaded...
            return;
        }
        //*********************************************
        //get current scroll position of window and set top of lightbox later
        pos = window.scrollY;
        //*********************************************
        //bug hack...
        document.getElementById('container').setAttribute("style", "display:none"); //hides bug in jquery where page scrolls to top for some reason on image load
        //*********************************************
        let match;
        let div = document.querySelector('.lightbox'); 
        let srcc = target.getAttribute("src"); 
        let clickedImg = srcc.replace('/thumbs', '/fullsize');
        try {
            for (let x in imgArray) { 
                if (imgArray[x] == clickedImg) {
                    match = true;
                    // set lightbox image source to the fullsize image:
                    let img = document.querySelector('.lightbox img');
                    img.src = imgArray[x];
                    img.onload = () => {
                        div.setAttribute('style', 'display:inline-grid');
                        div.classList.add('fadein');
                        let ldr = document.querySelector('.loader img');
                        ldr.setAttribute('style', 'display:none')
                        //*****************************************
                        document.body.setAttribute('style', 'overflow:hidden');
                        setTimeout(() => {
                            //**************************************
                            //bug hack - fade back in...  
                            document.getElementById('container').setAttribute("style", "display:block");
                            //scroll to position ********************
                            window.scrollTo(0, pos);
                            //***************************************
                        }, 50);
                        // fade in image then remove class
                        if(slider == "slide"){
                            img.className = "slideLeft";
                            setTimeout(function() {
                                img.classList.remove('slideLeft');
                            }, 400);
                        }
                        else if (slider == "zoom"){
                            img.className = "zoomOut";
                            setTimeout(function() {
                                img.classList.remove('zoomOut');
                            }, 400);
                        }
                        else {
                            img.className = "fadeIn";
                            setTimeout(function() {
                                img.classList.remove('fadein');
                            }, 400);
                        }
                        //********************************************
                        //          SET NAVIGATION POSITION
                        //********************************************
                        setNav();
                    };
                    //SHOW CAPTION ******************************
                    let $index = x;
                    if(captions){
                        if (captionsLoaded) {
                            //the captions.json has been created or gotten...
                            let xhr = new XMLHttpRequest();
                            xhr.open('GET', filePath + 'captions.json');
                            xhr.send();
                            xhr.onreadystatechange = function(e) {
                                if (this.readyState == 4 && this.status == 200) {
                                    let foo = JSON.parse(e.currentTarget.response);
                                    let captiondiv = document.querySelector('.caption');
                                    Object.entries(foo).forEach((item, index) => {
                                        if (index == $index){
                                            let $header = item[1].Header;
                                            let $caption = item[1].Caption;
                                            captiondiv.innerHTML = '';
                                            captiondiv.insertAdjacentHTML('beforeend', '<h3>' + $header + '</h3');
                                            captiondiv.insertAdjacentHTML('beforeend', '<p>' + $caption + '</p>');
                                        };
                                    });
                                    xhr.abort();
                                }
                            }
                        }
                        else { //captionsLoaded is false so something went wrong
                            console.log('There was a problem loading the captions. Try clearing the browser cache and refreshing.')
                        }
                    }
                    //*******************************************
                    break;
                }
                else {
                    match = false;
                };
            };
            if (!match) {
                alert("Couldn't find a matching image.");
                let ldrimg = document.querySelector(".loader-img");
                if (window.getComputedStyle(ldrimg).getPropertyValue("display") != "none" ){
                    ldrimg.setAttribute('style', 'display:none');
                };
                let ctnr = document.getElementById("container");
                if (window.getComputedStyle(ctnr).getPropertyValue("display") === "none" ){
                    ctnr.setAttribute('style', 'display:block');
                    ctnr.classList.add('fadein');
                };
                return;
            };
        }
        catch (err) {
            alert(err.message);
            return;
        };
    });

    //************************************************************************
    //          CLOSING THE IMAGE
    //************************************************************************
    document.addEventListener('mouseup', (e) => { //check if clicking off photo in order to close it
        let ltbx = document.querySelector('.lightbox');
        if(window.getComputedStyle(ltbx).getPropertyValue('display') != 'none' ){ // if lightbox is visible ...
            let elems = document.querySelector('.lightbox');
            let desc = elems.getElementsByTagName('*');
            let descendants = Array.prototype.slice.call(desc);
            for(elem of descendants) { //check if target is lightbox or descendant, & if so then DON'T close the lightbox photo
                if(elem == e.target){
                    var dontclose = true;
                }
            };
            if(!dontclose){
                closePhoto();
                dontclose = true;
            };
        };
    });


    closePhoto = () => {
        window.scrollTo(0, pos); 
        let img = document.querySelector('.lightbox img');
        img.src = '';    
        document.querySelector('.lightbox').setAttribute('style', 'display:none')
        document.body.setAttribute('style', 'overflow:visible')
    };

    //************************************************************************
    //          NAVIGATION
    //************************************************************************

    // HANDLE NAVIGATION BUTTONS & CLOSE    
    setNav = () => {
        let w = document.querySelector('.lightbox img').width - 10;
        let lnav = document.querySelector('.lightbox-nav');
        let close = document.querySelector('.closeP');
        lnav.setAttribute('style', 'display:block; margin-left:' + -w/2 + 'px; width:' + w + 'px' );
        close.setAttribute('style', 'display:block; margin-left:' + -w/2 + 'px; width:' + w + 'px' );
    };

    //ADD NAVIGATION LISTENERS...
    let ltbx = document.querySelector('.lightbox'); 
    ltbx.onclick = (e) => {
        let prev = document.querySelector('.nav-prev-photo');
        let next = document.querySelector('.nav-next-photo');
        let close = document.querySelector('.closeP');
        let descPrev = prev.children.item(0); //the target is always the single child (i.material-icons...)
        let descNext = next.children.item(0);
        let descClose = close.getElementsByTagName('*');
        let arrdescClose = Array.prototype.slice.call(descClose);
        for(elem of arrdescClose) { //check if target is lightbox or descendant, & if so then DON'T close the lightbox photo
            if(elem == e.target){
                closePhoto();
            }
        };
        if(descPrev == e.target){
            getPrevNxt(p = true, n = false); 
        }
        if(descNext == e.target){
            getPrevNxt(p = false, n = true); 
        }
    };

    getPrevNxt = () => {
        let currentImg = document.querySelector('.lightbox img').getAttribute('src');
        let match;
        for (var x = 0; x <= imgArray.length - 1; x++) {
            if (currentImg == imgArray[x]) {
                match = true;
            }
            if (match) {
                if (x == 0) {
                    navLinks(intPrev = imgArray.length - 1, intNext = x + 1, p, n);
                    return;
                }
                else if (x == imgArray.length - 1) {
                    navLinks(intPrev = x - 1, intNext = 0, p, n);
                    return;
                }
                else {
                    navLinks(intPrev = x - 1, intNext = x + 1, p, n);
                    return;
                }
            }
        }
    }

    // SET UP PREV/NEXT IMAGE
    navLinks = () => {
        let ldr = document.querySelector('.loader-img');
        ldr.setAttribute('style', 'display:block');
        let div = document.querySelector('.lightbox');
        let img = div.querySelector(".lightbox img");
        try {
            if (p) {
                img.innerHTML = '';
                img.src = imgArray[intPrev];
            }
            else if (n) {
                img.innerHTML = '';
                img.src = imgArray[intNext];
            }
            img.onload = prevNext = () => {
                //********************************************
                //          SLIDER ANIMATION 
                //********************************************
                if (slider == "slide") {
                    if (p){
                        img.className = 'slideRight';
                        setTimeout(function(){
                            img.classList.remove('slideRight');
                        }, 400);
                    }
                    else if(n){
                        img.className = 'slideLeft';
                        setTimeout(function(){
                            img.classList.remove('slideLeft');
                        }, 400);
                    }
                }
                else if (slider == "zoom") {
                    img.className = 'zoomOut';
                    setTimeout(function(){
                        img.classList.remove('zoomOut');
                    }, 400);
                }
                //********************************************
                //          SET NAVIGATION/CLOSE POSITION
                //********************************************
                setNav();
                //********************************************
                //SHOW CAPTION ******************************
                if (captions){
                    if (captionsLoaded) {
                        let xhr2 = new XMLHttpRequest();
                        xhr2.open('GET', filePath + 'captions.json');
                        xhr2.send();
                        xhr2.onreadystatechange = function(e) {
                            if (this.readyState == 4 && this.status == 200) {
                                let bar = JSON.parse(e.currentTarget.response);
                                let captiondiv = document.querySelector('.caption');
                                Object.entries(bar).forEach((item, index) => {
                                    if ((p && (index == intPrev)) || (n && (index == intNext))) {
                                        let $header = item[1].Header;
                                        let $caption = item[1].Caption;
                                        captiondiv.innerHTML = '';
                                        captiondiv.insertAdjacentHTML('beforeend', '<h3>' + $header + '</h3');
                                        captiondiv.insertAdjacentHTML('beforeend', '<p>' + $caption + '</p>');
                                    };
                                });
                                xhr2.abort();
                            }
                        }
                    }
                    else {
                        console.log('There was a problem loading the captions. Try deleting captions.json and reloading the web page.')
                    }
                }
            };
        } catch (err) {
            alert(err.message);
            return;
        }
    }

    //KEYS...

    document.addEventListener('keydown', (e) => {
        let close = document.querySelector('.closeP');
        if(window.getComputedStyle(close).getPropertyValue('display') != "none"){
            if (e.key === "ArrowLeft") {
                getPrevNxt(p = true, n = false);
            }
            if (e.key === "ArrowRight") {
                getPrevNxt(p = false, n = true);
            }
            if (e.key === "Escape") { // escape key maps to keycode `27`
                closePhoto();
            }
        }
    });

    //************************************************************************
    //          TOUCH/SWIPE EVENTS
    //************************************************************************
    let initialX = null, currentX = null, initialY = null, currentY = null, zooming = false;

    let lightbx = document.querySelector('.lightbox'); //should be lightbox and all children (incl lightbox-nav etc)...
    lightbx.addEventListener('touchstart', (e) => {
        initialX = e.touches[0].screenX;
        initialY = e.touches[0].screenY;
        zooming = false;
    });

    lightbx.addEventListener('touchmove', (e) => { 
        let $div = document.querySelector('.lightbox img');
        if (e.touches.length > 1) {
            zooming = true; //2 fingers
        }

        if($div.classList.contains("slideRight")){
            $div.classList.remove("slideRight");
        }
        else if($div.classList.contains("slideLeft")){
            $div.classList.remove("slideLeft");
        }

        let currentX = e.touches[0].screenX;
        let currentY = e.touches[0].screenY;

        let diffX = initialX - currentX;
        let diffY = initialY - currentY;

        if (Math.abs(diffX) > Math.abs(diffY)) { //sliding horizontally
            if (diffX > 0) {
                //swipe left
                $div.className = "swipeLeft";
            }
            else {
                //swipe right
                $div.className = "swipeRight";
            }
        }
    });

    lightbx.addEventListener('touchend', (e) => {
        let $div = document.querySelector('.lightbox img');
        let currentX = e.changedTouches[e.changedTouches.length - 1].screenX;
        let currentY = e.changedTouches[e.changedTouches.length - 1].screenY;
        //always remove the slider animation so it doesn't get stuck
        if ($div.classList.contains("swipeLeft")) {
            $div.classList.remove("swipeLeft");
        };
        if ($div.classList.contains("swipeRight")) {
            $div.classList.remove("swipeRight");
        };
        if (zooming) {
            return;
        };
        if (initialX === null || currentX === null) {
            return; //touch unsupported
        };

        let diffX = initialX - currentX;
        let diffY = initialY - currentY;

        if (Math.abs(diffX) > Math.abs(diffY)) { //sliding horizontally
            if (diffX > 35) {
                //swipe left
                $div.setAttribute('style', 'display:none');
                n = true;
                getPrevNxt(p = false, n = true);
            }
            else if (diffX < -35) {
                //swipe right
                $div.setAttribute('style', 'display:none');
                p = true;
                getPrevNxt(p = true, n = false);
            };
        }
        else { //sliding vertically
            if ($div.classList.contains("swipeLeft")) {
                $div.classList.remove("swipeLeft");
            };
            if ($div.classList.contains("swipeRight")) {
                $div.classList.remove("swipeRight");
            };
            return;
        };
    });