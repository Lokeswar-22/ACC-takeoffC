$(document).ready(function () {
  function showUser() {
    jQuery.ajax({
      url: '/api/aps/user/profile',
      success: function (profile) {
        var img = '<img src="' + profile.picture + '" height="30px">';
        $('#userInfo').html(img + profile.name);
      }
    });
  }
})
