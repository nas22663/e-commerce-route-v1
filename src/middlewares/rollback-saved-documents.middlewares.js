export const rollbackSavedDocuments = async (req, res, next) => {
  //model ,condition(_id)

  if (req.savedDocument) {
    // console.log(req.savedDocument);
    const { model, _id } = req.savedDocument;
    await model.findByIdAndDelete(_id);
  }
};
