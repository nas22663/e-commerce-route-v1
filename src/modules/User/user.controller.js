import User from "../../../DB/models/user.model.js";

//===========================================update user controller==============================================
export const updateUser = async (req, res, next) => {
  // Deconstruct data from req
  const {
    addresses,
    phoneNumbers,
    deletedAddresses,
    deletedPhoneNumbers,
    username,
  } = req.body;
  const { _id } = req.authUser;

  // Authorization check corrected: Allow if user is the profile owner or a super_admin
  // Find the user by _id
  const user = await User.findById(_id);
  if (
    req.authUser._id.toString() !== user._id.toString() && // User is not the profile owner
    req.authUser.role !== "super_admin" // AND user is not a super_admin
  ) {
    return res
      .status(403)
      .json({ message: "Unauthorized to update this profile" });
  }

  // Check if user wants to update the username
  if (username && username !== user.username) {
    const isNameExist = await User.findOne({ username });
    if (isNameExist) {
      return res.status(409).json({ error: "Username already exists" });
    }
    user.username = username;
  }

  // Add new addresses, avoiding duplicates
  if (addresses) {
    addresses.forEach((newAddress) => {
      if (!user.addresses.includes(newAddress)) {
        user.addresses.push(newAddress);
      }
    });
  }

  // Add new phone numbers, avoiding duplicates
  if (phoneNumbers) {
    phoneNumbers.forEach((newPhoneNumber) => {
      if (!user.phoneNumbers.includes(newPhoneNumber)) {
        user.phoneNumbers.push(newPhoneNumber);
      }
    });
  }

  // Delete specified addresses
  if (deletedAddresses && deletedAddresses.length > 0) {
    user.addresses = user.addresses.filter(
      (address) => !deletedAddresses.includes(address)
    );
  }

  // Delete specified phone numbers
  if (deletedPhoneNumbers && deletedPhoneNumbers.length > 0) {
    user.phoneNumbers = user.phoneNumbers.filter(
      (phoneNumber) => !deletedPhoneNumbers.includes(phoneNumber)
    );
  }

  // Save the updated user
  await user.save();

  // Return the updated user
  return res
    .status(200)
    .json({ success: true, message: "User updated", data: user });
};

//===========================================delete user controller==============================================

export const deleteUser = async (req, res, next) => {
  const { userId } = req.params; // Assuming the user ID is passed as a URL parameter
  const authUserId = req.authUser._id.toString();

  // Check if the auth user is trying to delete themselves or is a super_admin
  if (authUserId !== userId && req.authUser.role !== "super_admin") {
    return res
      .status(403)
      .json({ message: "Unauthorized to delete this profile" });
  }

  // Proceed with deletion
  const deletedUser = await User.findByIdAndDelete(userId);

  if (!deletedUser) {
    return res.status(404).json({ message: "User not found" });
  }

  return res
    .status(200)
    .json({ success: true, message: "User deleted successfully" });
};

// ===========================================get user profile data controller======================================

export const getUserProfileData = async (req, res, next) => {
  const { _id } = req.authUser;
  const user = await User.findById(_id);
  return res
    .status(200)
    .json({ success: true, message: "User profile data", data: user });
};
