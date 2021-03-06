var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * Representation of a testimony supplied by a user.
 * There are a couple of testimonies loaded from the previous web app by default.
 * See config/insert_testimonies.js
 * 
 * @type type
 */
var testimonial = new Schema({
  
  author: {
    type: String,
    required: false,
    unique: true
  },
  title: { // the author's occupation (e.g. community or career)
    type: String,
    required: false,
    unique: false
  },
  email: {
    type: String,
    required: true,
    unique: false
  },
  text: {
    type: String,
    required: false,
    unique: true
  }
});

module.exports = mongoose.model('testimonials', testimonial);