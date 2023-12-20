const months = {
  'January': '01',
  'February':'02',
  'March':'03',
  'April':'04',
  'May':'05',
  'June':'06',
  'July':'07',
  'August':'08',
  'September':'09',
  'October':'10',
  'November':'11',
  'December':'12'
};
const us_states = {
    'AB': 'Alberta',
    'BC': 'British Columbia',
    'MB': 'Manitoba',
    'NB': 'New Brunswick',
    'NL': 'Newfoundland and Labrador',
    'NS': 'Nova Scotia',
    'NT': 'Northwest Territories',
    'NU': 'Nunavut',
    'ON': 'Ontario',
    'PE': 'Prince Edward Island',
    'QC': 'Quebec',
    'SK': 'Saskatchewan',
    'YT': 'Yukon',
    'AK': 'Alaska',
    'AL': 'Alabama',
    'AR': 'Arkansas',
    'AS': 'American Samoa',
    'AZ': 'Arizona',
    'CA': 'California',
    'CO': 'Colorado',
    'CT': 'Connecticut',
    'DC': 'District of Columbia',
    'DE': 'Delaware',
    'FL': 'Florida',
    'GA': 'Georgia',
    'GU': 'Guam',
    'HI': 'Hawaii',
    'IA': 'Iowa',
    'ID': 'Idaho',
    'IL': 'Illinois',
    'IN': 'Indiana',
    'KS': 'Kansas',
    'KY': 'Kentucky',
    'LA': 'Louisiana',
    'MA': 'Massachusetts',
    'MD': 'Maryland',
    'ME': 'Maine',
    'MI': 'Michigan',
    'MN': 'Minnesota',
    'MO': 'Missouri',
    'MP': 'Northern Mariana Islands',
    'MS': 'Mississippi',
    'MT': 'Montana',
    'NA': 'National',
    'NC': 'North Carolina',
    'ND': 'North Dakota',
    'NE': 'Nebraska',
    'NH': 'New Hampshire',
    'NJ': 'New Jersey',
    'NM': 'New Mexico',
    'NV': 'Nevada',
    'NY': 'New York',
    'OH': 'Ohio',
    'OK': 'Oklahoma',
    'OR': 'Oregon',
    'PA': 'Pennsylvania',
    'PR': 'Puerto Rico',
    'RI': 'Rhode Island',
    'SC': 'South Carolina',
    'SD': 'South Dakota',
    'TN': 'Tennessee',
    'TX': 'Texas',
    'UT': 'Utah',
    'VA': 'Virginia',
    'VI': 'Virgin Islands',
    'VT': 'Vermont',
    'WA': 'Washington',
    'WI': 'Wisconsin',
    'WV': 'West Virginia',
    'WY': 'Wyoming'
};

    
let dt;
// Initialize the map
const map = L.map('map').setView([51.034599, -114.053711], 10);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

function createCircle(lat, lng, color, radius) {
    return L.circle([lat, lng], {
        color: color,
        fillColor: color,
        fillOpacity: 0.3,
        radius: radius,
    });
}

function changeCircleColor(circle, newColor) {
    circle.setStyle({ color: newColor, fillColor: newColor });
}

function filter(col){
    var select = $('<select />')
        .appendTo( dt.column(col).header())
        .on( 'change', function () {
           if ( this.value == 'all' ) {
            dt.column(col).search( '' )
            } else {
            dt.column(col).search( $(this).val() )
            }
            dt .order( [ 8, 'desc' ] ).draw();
        } );
 
    select.append( '<option value=all>All</option>') ;
    dt
      .column(col)
      .cache( 'search' )
      .sort()
      .unique()
      .each( function ( d ) {
          select.append( $('<option value="'+d+'">'+d+'</option>') );
      } );
}
function updateMapMarkers() {
    // Clear existing markers
    console.log('updating markers');
    map.eachLayer(function (layer) {
        if (layer instanceof L.Circle) {
            map.removeLayer(layer);
        }
    });

      let markerBounds = L.latLngBounds();
    let rows = dt.rows({ filter: 'applied' });
    let maxRunners=0;
    rows.every(function () {
        let data = this.data();
        let runners = parseFloat(data[5]); 
        if (runners > maxRunners) {
            maxRunners = runners;
        }
    });
    // Iterate through the filtered DataTable rows
    rows.every(function () {
        let data = this.data();
        let lat = parseFloat(data[9]); 
        let lng = parseFloat(data[10]);
        if (!isNaN(lat) && !isNaN(lng)) {
        radius = parseFloat(data[5])  / maxRunners * 100000 + 2000;
        let marker = createCircle(lat, lng, "red", radius).addTo(map)
                  .bindPopup('Name: ' + data[0] + '<br>State: ' + data[1]
                      + '<br>City: ' + data[2] + '<br>Next Race: ' + data[3]
                      + '<br>Runners: ' + data[5]);
        markers.push(marker);
        markerBounds.extend(marker.getLatLng());
        }
    });
   map.fitBounds(markerBounds);
}

let markers = [];
fetch('combined_markers.json')
    .then(response => response.json())
    .then(data => {
        let tableBody = '';
        data.forEach((item, index) =>  {
            tableBody += `<tr>
                <td><a href="${item.registration}" target="_blank">${item.name}</a></td>
                <td>${us_states[item.state]}</td>
                <td>${item.city}</td>
                <td>${item.date_next}</td>
                <td>${months[item.month]}</td>
                <td>${item.size_number}</td>
                <td>${item.temp_avg}</td>
                <td>${item.certified}</td>
                <td>${parseInt(item.bq_this)}</td>
                <td>${item.lat}</td>
                <td>${item.lng}</td>
            </tr>`;
        });
        document.querySelector("#races tbody").innerHTML = tableBody;
        dt=$('#races').DataTable({aLengthMenu: [ [ 5, 10, 20 ], [ 5, 10, 20] ]})
        dt.order( [ 8, 'desc' ] ).draw();
        filter(1);
        filter(4);
        filter(7);
        updateMapMarkers();
        dt.on('search.dt', function () { updateMapMarkers(); });
        dt.column( 9 ).visible( false ); //hide longitude
        dt.column( 10 ).visible( false ); //hide latitude
    });
const minEl = document.querySelector('#min');
const maxEl = document.querySelector('#max');
minEl.addEventListener('input', function () {
    dt.draw();
    updateMapMarkers()
});
maxEl.addEventListener('input', function () {
    dt.draw();
    updateMapMarkers()
}); 
// Custom range filtering function
DataTable.ext.search.push(function (settings, data, dataIndex) {
    let min = parseInt(minEl.value, 10);
    let max = parseInt(maxEl.value, 10);
    let people = parseFloat(data[5]) || 0; // use data for the people column
 
    if (
        (isNaN(min) && isNaN(max)) ||
        (isNaN(min) && people <= max) ||
        (min <= people && isNaN(max)) ||
        (min <= people && people <= max)
    ) {
        return true;
    }
 
    return false;
});

$('#races tbody').on('click', 'tr', function () {
    var row = dt.row(this).data();
    var lat = parseFloat(row[9]); 
    var lng = parseFloat(row[10]);

    if (!isNaN(lat) && !isNaN(lng)) {
        map.setView([lat, lng], 12); // Zoom to the marker's location

        for (var i = 0; i < markers.length; i++) {
            var marker = markers[i];
            if (marker.getLatLng().lat === lat && marker.getLatLng().lng === lng) {
             changeCircleColor(marker, 'blue'); // Change the color of the marker;
            }
        }
    }
});
