import { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { db } from '../../firebase/firebaseConfig'; 
import { collection, addDoc } from "firebase/firestore"; 
const mBoxBaseUrl = import.meta.env.VITE_MAPBOX_BASE_URL; //for static map image 
const mBoxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN; //for static map image;


export default function VenueDetailsCard({ selectedVenue, venueDetails }) {
  const venueCategories = ["Bar", 'Club', 'Restaurant'];
  const venueFeatures = ["Alcohol", "Food", "Cover Fee", "Coat Check", "Dress Code", "Music", "Parking", "WiFi", "Outdoor Seating", "Dance Floor", "Happy Hour"];
  const [venueDescription, setVenueDescription] = useState(''); //allow user to update venue description
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState([]);        

  useEffect(() => {
    setVenueDescription(venueDetails?.description || '');
    setSelectedCategory('');
    setSelectedFeatures([]);
  }, [venueDetails]);


  const venue ={
    venueId: crypto.randomUUID(),
    name: selectedVenue.name, //CORE
    address: selectedVenue.location.formatted_address, //CORE (place search api)
    lat: selectedVenue.geocodes.main.latitude, //CORE
    long: selectedVenue.geocodes.main.longitude, //CORE
    website: venueDetails.website || '',  //DETAILS (place details api)
    phone: venueDetails.tel || '',  //DETAILS
    description: venueDetails.description || venueDescription, //DETAILS
    hours: venueDetails.hours.regular, //DETAILS
    hoursDisplay: venueDetails.hours.display || '',
    popularity: venueDetails.popularity || '', //DETAILS
    price: venueDetails.price || '',  //DETAILS
    category: selectedCategory,
    features: selectedFeatures, 
    dailyCheckIns:[{}], //--> Whenever a user signs in, we add {user:_ , date:_,}, (this lets us to track check-ins/day & popular hours overtime)
    ratings: [],  //--> Whenever a user rates a venue, their rating (1-5) is added to the array. Get sum and divide by ratings.length for avg. 
    mapImage: `${mBoxBaseUrl}/dark-v11/static/pin-l+0000ff(${selectedVenue.geocodes.main.longitude},${selectedVenue.geocodes.main.latitude})/${selectedVenue.geocodes.main.longitude},${selectedVenue.geocodes.main.latitude},10,0,34/560x200@2x?access_token=${mBoxToken}`,
  };

  console.log("venue:", venue);


  //-- Get the venue's hours for today
  function getVenueHours(venue) {
    const today = new Date().getDay();
    if (venue.hours && venue.hours[today]) {
      const open = venue.hours[today].open.startsWith("0") ? venue.hours[today].open.slice(1)[0] + ':' + venue.hours[today].open.slice(2) : venue.hours[today].open;
      const close = Number(venue.hours[today].close.slice(0,2)) > 12 ? (Number(venue.hours[today].close.slice(0,2)) - 12).toString() + ':' + venue.hours[today].close.slice(2,4) : venue.hours[today].close;
      return open === "0:00" && close === "11:59" ? "24h" : `${open} AM - ${close} PM`;
    } else {
      return "N/A";
    }
  }


  const handleFieldChange = (field, value) => {
    if (field === 'description') {
      setVenueDescription(value);
    }
  };
  
  //-- SAVE VENUE OBJECT in Firestore "venues" collection
  async function addVenueToDb(id, venue) {
    try {
    const docRef = await addDoc(collection(db, "venues"), {
        venue
        });
        console.log("Document written with ID: ", docRef.id);
    } catch (e) {
    console.error("Error adding document: ", e);
    }
  }



  return(
    <div className="venueDetails-card">

      <div className='map-img-container'>
        <img src={venue.mapImage} alt="Map Image" />
      </div>

      <div className='details_card-main-info'>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            <h2 className='card-title'>{venue.name}</h2>
        </div>

        {/* secondary info (address, hours etc.) */}
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <p className="secondaryTxt" >{venue.address}</p>
          <p className="secondaryTxt">{venue.phone}</p>
          <div >
            {/* <p className="secondaryTxt">{venue.hoursDisplay}</p> */}
            <p className="secondaryTxt">{getVenueHours(venue)}</p>
          </div>
        </div>

        {venue.website && (
        <a className='secondaryTxt' style={{ color: 'blue', padding:0, margin:0 }} href={venue.website} target="_blank" rel="noopener noreferrer">
          {venue.website.replace(/^https?:\/\//, '')}
        </a> )}
        
        <div style={{ borderBottom: '.5px solid gray', paddingTop: '1rem' }}></div>
        {/* VENUE DESCRIPTION BOX*/}
        <div>
          <h4 style={{ margin: '.5rem', marginLeft:'0' }}>Description</h4>
          <textarea style={{ width: '100%', minHeight: '5rem', backgroundColor: '#fff', color: 'black', borderRadius: '.15rem', borderColor:'#c0c0c0', borderWidth: '.01rem', fontFamily: 'inherit', padding:'.3rem', resize: 'none', }}
            value={venueDescription}
            onChange={(e) => handleFieldChange('description', e.target.value)}
          />
        </div>

        {/* VENUE CATEGORIES */}
        <h4 style={{ margin: '.5rem', marginLeft:'0' }}>Category</h4>
        <div style={{display:'flex'}}>
          {venueCategories.map((cat, index) => (
            <button key={`cat-${index}`} 
            className={`chip ${selectedCategory === cat ? 'selected' : ''}`}
            onClick={() => setSelectedCategory(cat)}> 
              {cat} 
            </button> ))}
        </div>

        {/* VENUE FEATURES */}
        <h4 style={{ margin: '.5rem', marginLeft:'0' }}>Features</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap'}}>
          {venueFeatures.map((feat, index) => (
            <button key={`feat-${index}`}
              className={`chip ${selectedFeatures.includes(feat) ? 'selected' : ''}`}
              onClick={() => setSelectedFeatures(feats => {
                return feats.includes(feat) ? feats.filter(item => item !== feat) : [...feats, feat]
              })}
            >
              {feat}
            </button>
          ))}
        </div>

        {/* ADD TO DB */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding:'0rem'}}>
          <button className='btn-db' onClick={() => {
            addVenueToDb(venue.venueId, venue)
            console.log(venue);
            }}>Add</button>
        </div>
      </div>
    </div>
  )}



//-- Prop validation
VenueDetailsCard.propTypes = {
  selectedVenue: PropTypes.shape({
    fsq_id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    categories: PropTypes.arrayOf(PropTypes.object).isRequired,
    geocodes: PropTypes.shape({
      main: PropTypes.shape({ 
        latitude: PropTypes.number.isRequired,
        longitude: PropTypes.number.isRequired,
      }).isRequired,
    }).isRequired,
    location: PropTypes.shape({
      formatted_address: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  venueDetails: PropTypes.shape({
    description: PropTypes.string,
    hours: PropTypes.shape({
      display: PropTypes.string,
      regular: PropTypes.array,
    }),
    hours_popular: PropTypes.array,
    popularity: PropTypes.number,
    price: PropTypes.string,
    ratings: PropTypes.arrayOf(PropTypes.number),
    website: PropTypes.string,
    tel: PropTypes.string,
  }).isRequired,
  //technically not required as this is info is pushed from the app;
  dailyCheckIns: PropTypes.arrayOf(PropTypes.shape({
    user: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
  })),
};


