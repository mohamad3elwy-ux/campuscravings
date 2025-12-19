$(document).ready(function () {
  var token = localStorage.getItem('sessionToken');
  if (!token) {
    window.location.href = '/';
    return;
  }

  var allTrucks = [];

  loadTrucks();
  updateCartCount();

  $('#logoutLink').on('click', function (e) {
    e.preventDefault();
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('loggedInUser');
    window.location.href = '/';
  });

  $('#searchInput').on('input', filterTrucks);
  $('#filterSelect').on('change', filterTrucks);

  function loadTrucks() {
    $.ajax({
      url: '/api/v1/trucks/view',
      method: 'GET',
      success: function (trucks) {
        $('#loadingMsg').hide();
        allTrucks = trucks;
        renderTrucks(trucks);
      },
      error: function (xhr) {
        $('#loadingMsg').hide();
        var message = 'Failed to load trucks';
        if (xhr.responseJSON && xhr.responseJSON.error) {
          message = xhr.responseJSON.error;
        }
        $('#errorMsg').text(message).show();
      }
    });
  }

  function filterTrucks() {
    var search = $('#searchInput').val().toLowerCase();
    var filter = $('#filterSelect').val();

    var filtered = allTrucks.filter(function (truck) {
      return truck.truckName.toLowerCase().includes(search);
    });

    if (filter === 'popular') {
      filtered.sort(function (a, b) { return (b.rating || 0) - (a.rating || 0); });
    } else if (filter === 'quick') {
      filtered.sort(function (a, b) { return (a.prepTime || 15) - (b.prepTime || 15); });
    } else if (filter === 'highly-rated') {
      filtered.sort(function (a, b) { return (b.rating || 0) - (a.rating || 0); });
    }

    renderTrucks(filtered);
  }

  function renderTrucks(trucks) {
    var container = $('#trucksContainer');
    container.empty();

    if (trucks.length === 0) {
      $('#noResultsMsg').show();
      return;
    }

    $('#noResultsMsg').hide();

    trucks.forEach(function (truck) {
      var isOpen = truck.orderStatus === 'available';
      var statusBadge = isOpen ? 
        '<span style="position:absolute;top:15px;right:15px;background:#22c55e;color:white;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:500;">Open Now</span>' : 
        '<span style="position:absolute;top:15px;right:15px;background:#ef4444;color:white;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:500;">Closed</span>';
      
      var card = `
        <div class="col-sm-6 col-md-4" style="margin-bottom:25px;">
          <div style="background:white;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,0.07);overflow:hidden;transition:all 0.2s ease;" 
               onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 12px 25px rgba(0,0,0,0.12)';" 
               onmouseout="this.style.transform='';this.style.boxShadow='0 4px 6px rgba(0,0,0,0.07)';">
            <div style="position:relative;height:180px;background:linear-gradient(135deg, #7d0c0c 0%, #9a0f0f 50%, #b81414 100%);display:flex;align-items:center;justify-content:center;">
              ${statusBadge}
              <div style="text-align:center;color:white;">
                <div style="font-size:48px;margin-bottom:10px;">🍔</div>
                <div style="font-size:18px;font-weight:600;">${truck.truckName}</div>
              </div>
            </div>
            <div style="padding:20px;">
              <h3 style="font-size:20px;margin:0 0 10px;color:#1f2937;">${truck.truckName}</h3>
              <div style="display:flex;align-items:center;color:#6b7280;margin-bottom:10px;">
                <span class="glyphicon glyphicon-map-marker" style="margin-right:5px;"></span>
                <span style="font-size:14px;">Campus Location</span>
              </div>
              <p style="color:#6b7280;font-size:14px;margin-bottom:15px;">Delicious food from our truck!</p>
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:15px;">
                <div style="display:flex;align-items:center;gap:15px;">
                  <div style="display:flex;align-items:center;">
                    <span class="glyphicon glyphicon-star" style="color:#eab308;margin-right:3px;"></span>
                    <span style="font-size:14px;font-weight:500;">4.5</span>
                  </div>
                  <div style="display:flex;align-items:center;color:#6b7280;">
                    <span class="glyphicon glyphicon-time" style="margin-right:3px;"></span>
                    <span style="font-size:14px;">15 min</span>
                  </div>
                </div>
              </div>
              <div style="display:flex;align-items:center;justify-content:space-between;">
                <span style="font-size:13px;color:#9ca3af;">50 reviews</span>
                <a href="/customer/truck/${truck.truckId}" class="btn btn-primary" style="padding:8px 20px;">View Menu</a>
              </div>
            </div>
          </div>
        </div>
      `;
      container.append(card);
    });
  }

  function updateCartCount() {
    $.ajax({
      url: '/api/v1/cart/view',
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token },
      success: function (cartItems) {
        var count = 0;
        cartItems.forEach(function (item) {
          count += item.quantity;
        });
        $('#cartCount').text(count);
      },
      error: function () {
        $('#cartCount').text('0');
      }
    });
  }
});
