import { useState, useEffect } from "react";
import { VscLocation, VscCallOutgoing  } from "react-icons/vsc";
import PropTypes from 'prop-types';
import { db } from '../../firebase/firebaseConfig'; 
import { collection, addDoc } from "firebase/firestore"; 


export default function VenueDetailsCard({ selectedVenue, venueDetails }) {
  const mapBoxToken = 'pk.eyJ1IjoiamphZCIsImEiOiJjbHJmbjV1cTYwMzliMmlwMGhncjdyNzNwIn0.nhw6ufJ_ZBax2USJU1KvMA'; //for loading static map img
  const [venueDescription, setVenueDescription] = useState(''); //allow user to update/add venue description

  // Update fields when user edits - Only venueDescription atm
  useEffect(() => {
    setVenueDescription(venueDetails?.description || '');
  }, [venueDetails]);

//-- Update venueObj if user edits a field. 
const handleFieldChange = (field, value) => {
    if (field === 'description') {
      setVenueDescription(value);
    }
    console.log(venueDescription)
  };

  const venueObj = {
    //extracted venue params 
      id: selectedVenue.fsq_id,
      name: selectedVenue.name, 
      categories: selectedVenue.categories, 
      geocodes: selectedVenue.geocodes, 
      location: selectedVenue.location.formatted_address, 
      mapImage: `https://api.mapbox.com/styles/v1/mapbox/outdoors-v11/static/pin-l+df2020(${selectedVenue.geocodes.main.longitude},${selectedVenue.geocodes.main.latitude})/${selectedVenue.geocodes.main.longitude},${selectedVenue.geocodes.main.latitude},10,0,34/560x200@2x?access_token=${mapBoxToken}`,
    //extracted venue details params 
      description: venueDescription, 
      features: venueDetails.features || null, 
      hoursDisplay: venueDetails.hours ? venueDetails.hours.display : null,
      popularHours: venueDetails.hours_popular || null, 
      popularity: venueDetails.popularity || null,
      price: venueDetails.price || null, 
      rating: venueDetails.rating || null, 
      tastes: venueDetails.tastes || null,
      website: venueDetails.website || null, 
      telephone: venueDetails.tel || null, 
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
    <div className='details_card'>
      <div className='details_card-img-container'>
        <img src={venueObj.mapImage} alt="Map Image" />
      </div>
  
      {/* title */}
      <div className='details_card-main-info'>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
          <h2 className='details_card-title'>{venueObj.name}</h2>
        </div>
  
        {/* secondary info (address, hours etc.) */}
        <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem', justifyContent: 'space-between' }}>
          {venueObj.location && (
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', color: 'gray', gap: '.2rem' }}>
              <VscLocation />
              <p className='secondaryTxt'>{venueObj.location}</p>
            </div>
          )}
          {venueObj.telephone && (
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', color: 'gray', gap: '.5rem' }}>
              <VscCallOutgoing size={14} />
              <p className='secondaryTxt' style={{ paddingRight: '1rem' }}>{venueObj.telephone}</p>
            </div>
          )}
        </div>
  
        {venueObj.website && (
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <a className='secondaryTxt' style={{ color: 'blue', marginLeft: '1.4rem', paddingRight: '1rem' }} href={venueObj.website} target="_blank" rel="noopener noreferrer">
              {venueObj.website.replace(/^https?:\/\//, '')}
            </a>
          </div>
        )}

        {/* categories & other venue descriptors -TODO: create function to load these + additional categories/features */}
        <div style={{ borderBottom: '.5px solid gray', marginRight: '1rem', paddingTop: '1rem' }}></div>
        {venueObj.features && venueObj.features.food_and_drink && venueObj.features.food_and_drink.alcohol && venueObj.features.food_and_drink.alcohol.cocktails && (
          <div style={{ display: 'flex', flexDirection: 'row', gap: '1.5rem', maxWidth: '50%' }}>
            {venueObj.features.food_and_drink.alcohol && (
              <div style={{ color: 'gray', fontSize: '14px' }}>
                <p className="venue-feature"> <span>&#10003;</span> Alcohol</p>
              </div>
            )}
            {venueObj.features.services && venueObj.features.services.dine_in && (
              <div style={{ color: 'gray', fontSize: '14px' }}>
                <p className="venue-feature"> <span>&#10003;</span> Dine in</p>
              </div>
            )}
            {venueObj.features.services && venueObj.features.services.dine_in && venueObj.features.services.dine_in.reservations && (
              <div style={{ color: 'gray', fontSize: '14px' }}>
                <p className="venue-feature"> <span>&#10003;</span> Reservations</p>
              </div>
            )}
          </div>
        )}

        {/* VENUE DESCRIPTION BOX*/}
        <div style={{ marginRight: '1rem' }}>
          <h4 style={{ margin: '.5rem', marginLeft:'0' }}>Description</h4>
          <textarea
          style={{ width: '100%', minHeight: '5rem', backgroundColor: '#ffffcc', color: 'black', borderRadius: '.15rem', borderColor:'#c0c0c0', borderWidth: '.01rem', fontFamily: 'inherit', padding:'.3rem', resize: 'none', }}
            value={venueDescription}
            onChange={(e) => handleFieldChange('description', e.target.value)}
          />
        </div>

        {/* CATEGORIES */}
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingRight: '1rem' }}>
          <div>
            <h4 style={{ color: '#242424', marginBottom: 0 }}>Categories</h4>
            <div style={{ display: 'flex', flexDirection: 'row', color: 'gray', fontSize: '14px' }}>
              {venueObj.categories && venueObj.categories.map((cat) => (
                <p key={cat.short_name} style={{ paddingRight: '.5rem', margin: 0 }}>{cat.short_name} </p>
              ))}
            </div>
          </div>
    
          <div>
            <h4 style={{ color: '#242424', marginBottom: 0 }}>Rating</h4>
            <div style={{ display: 'flex', flexDirection: 'row', color: 'gray', fontSize: '14px', alignItems: 'center', gap: '.4rem' }}>
              {venueObj.rating}
            </div>
          </div>
  
          <div>
            <h4 style={{ color: '#242424', marginBottom: 0 }}>Popularity</h4>
            <div style={{ display: 'flex', flexDirection: 'row', color: 'gray', fontSize: '14px', alignItems: 'center', gap: '.4rem' }}>
              {venueObj.popularity && venueObj.popularity.toFixed(1)}
            </div>
          </div>
        </div>
      </div>
  

    {/* ADD TO DB */}
    <div style={{ display: 'flex', justifyContent: 'flex-end', padding:'1rem', paddingTop:'2rem'}}>
      <button className='btn-db' onClick={() => addVenueToDb(venueObj.id, venueObj)}>Add</button>
    </div>
  </div>
  )
}



//-- Validating props
VenueDetailsCard.propTypes = {
  selectedVenue: PropTypes.shape({
    fsq_id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    categories: PropTypes.arrayOf(PropTypes.object).isRequired,
    geocodes: PropTypes.shape({
      main: PropTypes.shape({ latitude: PropTypes.number.isRequired,longitude: PropTypes.number.isRequired}).isRequired,
    }).isRequired,
    location: PropTypes.shape({formatted_address: PropTypes.string.isRequired,}).isRequired,
  }).isRequired,
  venueDetails: PropTypes.shape({
    description: PropTypes.string,
    features: PropTypes.object,
    hours: PropTypes.shape({
      display: PropTypes.string,
    }),
    hours_popular: PropTypes.object,
    popularity: PropTypes.number,
    price: PropTypes.string,
    rating: PropTypes.number,
    tastes: PropTypes.string,
    website: PropTypes.string,
    tel: PropTypes.string,
  }).isRequired,
};




