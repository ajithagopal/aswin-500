
$(document).ready(function(){

    var vid = document.getElementById("ashwin-intro-video")
    
    $("#vid-start-btn").click(function() {
        let status = $(this).attr("data-status")
        if(status === 'pause') {
            vid.play()
            $(this).text('Pause')
            $(this).attr("data-status", "play")
        } else {
            vid.pause()
            $(this).text('Play')
            $(this).attr("data-status", "pause")
        }
    })

    // var cWidth = document.body.clientWidth;

    // if(cWidth < 500) {
    //     $("#mask circle").attr("r", 140)
    //     $("#mask #mask-circle-2").attr("cx", 220)
    //     $("#binoLines image").attr("x","-125").attr("y","-114").attr("width","470").attr("height","293.75")

    // } else if(cWidth < 900) {
    //     $("#mask circle").attr("r", 180)
    //     $("#mask #mask-circle-2").attr("cx", 300)
    //     $("#binoLines image").attr("x","-153").attr("y","-150").attr("width","600").attr("height","375")
    // }

    var prevScrollpos = window.scrollY;
    
    $(this).scroll(function() {
        if ($(this).scrollTop() >  100) {
            var currentScrollPos = window.scrollY;
            if (prevScrollpos > currentScrollPos) {
                $(".header").addClass("header-move");
                $(".header").css("transform", "translateY(0px)");
            } else {
                $(".header").css("transform", "translateY(-100px)");
            }
            prevScrollpos = currentScrollPos;

        } else if($(this).scrollTop() <= 10) {
            $(".header").removeClass("header-move");
        }
        prevScrollpos = window.scrollY;
    });

    
    
    // $(".top-banner .banner .item1").addClass("start-animate");
    $(".top-banner .banner .item2").addClass('start-animate');
    window.setTimeout(function(){
        // $(".top-banner .banner .item2").addClass('start-animate');
    }, 2000);

    $(".share-btn").click(function(){ 
        
        var sharetext = $("title").text();
        var shareurl = window.location.href;

        if (navigator.share && typeof sharetext != "undefined" && typeof shareurl != "undefined" && (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))) {
            navigator.share({
                title: sharetext,
                text: sharetext,
                url: shareurl
            });
        } else {
            $(this).next(".share-list").toggle();
        }
    });  

    $(".top-banner .scroll-btn").click(function(){ 
        // alert($(".article-content").offset().top)
        $(window).scrollTop($(".article-content").offset().top);
    });  

   
}); 

$(document).mouseup(function(e) {
    var container = $(".share-btn");
    var maps = $(".see-map, .map-list li");
    if (!container.is(e.target) && container.has(e.target).length === 0) {
        $(".share-list").slideUp();
    }
    if (!maps.is(e.target) && maps.has(e.target).length === 0) {
        $(".see-map").removeClass("opened");
    }
});


const cards = document.querySelector(".cards");
const range = 40;

// const calcValue = (a, b) => (((a * 100) / b) * (range / 100) -(range / 2)).toFixed(1);
const calcValue = (a, b) => (a/b*range-range/2).toFixed(1) // thanks @alice-mx

let timeout;
document.addEventListener('mousemove', ({x, y}) => {
  if (timeout) {
    window.cancelAnimationFrame(timeout);
  }
  	
  timeout = window.requestAnimationFrame(() => {
    const yValue = calcValue(y, window.innerHeight);
    const xValue = calcValue(x, window.innerWidth);

    cards.style.transform = `rotateX(${yValue}deg) rotateY(${xValue}deg)`;

	})
}, false);