$(document).ready(function () {
    $('.card-slide-testimonial').slick({
      dots: false,
      arrows: false,
      slidesToShow: 3,
      slidesToScroll: 1,
      autoplay:true,
      arrows:true,
      centerMode: true,
      centerPadding: '0px',
      autoplaySpeed: 1500,
      mobileFirst: true,
      responsive: [
        {
          breakpoint: 320,
          settings: { slidesToScroll: 1, slidesToShow: 1, centerMode: false }
        },
        {
          breakpoint: 480,
          settings: { slidesToShow: 1, centerMode: false }
        },
        {
          breakpoint: 768,
          settings: { slidesToShow: 2, slidesToScroll: 1, centerMode: false }
        },
        {
          breakpoint: 992,
          settings: { slidesToShow: 3, slidesToScroll: 1 }
        },
        {
          breakpoint: 1200,
          settings: { slidesToShow: 3, slidesToScroll: 1 }
        }
      ]
    });
  });