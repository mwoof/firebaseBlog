const isEmail = (email) => {
  let regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(regEx)) return true;
  else return false;
};
const isPass = (password) => {
  let regEx = /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/;
  if (password.match(regEx)) return true;
  else return false;
};
const isUsNam = (username) => {
  let regEx = /^(?=.{8,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/;
  if (username.match(regEx)) return true;
  else return false;
};
const isEmpty = (string) => {
  if (string.trim() === '') return true;
  else return false;
};

const inValEmail = 'Please enter a valid email address';
const inValEmpty = 'Please check to make sure there are no empty fields';
const inValPass = 'Password must contain at least 6 characters, 1 number, and a combination of uppercase and lowercase letters';
const inValPassMtch = 'Passwords do not match';
const inValUsername = "Username must be 6 to 20 characters long and connot contain '_' or '.'";

exports.validateSignupData = (data) => {
      let errors = {};

      if (isEmpty(data.email)) {
        errors.email = inValEmpty;
      } else if (!isEmail(data.email)) {
        errors.email = inValEmail;
      }

      // if (isEmpty(data.password)) errors.password = inValEmpty;
      if (isEmpty(data.password)) {
        errors.password = inValEmpty;
      } else if (!isPass(data.password)) {
        errors.password = inValPass;
      }
      if (data.password !== data.confirmPassword)
        errors.confirmPassword = inValPassMtch;
      // if (isEmpty(data.username)) errors.username = inValEmpty;
      if (isEmpty(data.username)) {
        errors.username = inValEmpty;
      } else if (!isUsNam(data.username)) {
        errors.username = inValUsername;
      }

      return {
        valid: Object.keys(errors).length === 0  ? true : false,
        errors
      };
};

exports.validateSigninData = (data) => {
      let errors = {};

      if (isEmpty(data.email)) {
        errors.email = inValEmpty;
      } else if (!isEmail(data.email)) {
        errors.email = inValEmail;
      }
      if (isEmpty(data.password)) errors.password = inValEmpty;

      return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
      };
};

exports.reduceUserDetails = (data) => {
      let userDetails = {};

      if (!isEmpty(data.bio.trim())) userDetails.bio = data.bio;
      if (!isEmpty(data.website.trim())) {
        // https://website.com
        if (data.website.trim().substring(0, 4) !== 'http') {
          userDetails.website = `http://${data.website.trim()}`;
        } else userDetails.website = data.website;
      }
      if (!isEmpty(data.location.trim())) userDetails.location = data.location;

      return userDetails;
};
