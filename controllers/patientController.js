const Patient = require('../models/Patient')
const asyncHandler = require('express-async-handler')


// @route GET /patients
const getAllPatients = asyncHandler(async (req, res) => {
    const patients = await Patient.find().lean()
    if(!patients?.length) {
        return res.status(400).json({
            message: 'No patient data is found here'
        })
    }
    res.json(patients)
})


// @route POST/patients
const createNewPatient = asyncHandler(async (req, res) => {
    const { pID, patientName, address, mobileNumber, deceaseRecordOne, medicineRecordOne, doctorID } = req.body

    if(!pID || !patientName || !address || !mobileNumber || !deceaseRecordOne || !medicineRecordOne || !Array.isArray(doctorID) || !doctorID.length ) {
        return res.status(400).json({
            message: 'All fields are required'
        })
    }

    const duplicate = await Patient.findOne({pID}).lean().exec()
    if(duplicate) {
        return res.status(400).json({
            message: 'Duplicate Email ID (PID)'
        })
    }

    const patientObject = { pID, patientName, address, mobileNumber, deceaseRecordOne, medicineRecordOne, doctorID }

    const patient = await Patient.create(patientObject)

    if(patient) {
        res.status(201).json({
            message: `New user ${patientName} with token ${patient.pToken} created`
        })
    }
    else {
        res.status(400).json({
            message: `Invalid patient data received`
        })
    }

})


// @route PATCH/patients
const updatePatient = asyncHandler(async (req, res) => {
    const { pToken, pID, id, patientName, address, mobileNumber, deceaseRecordOne, medicineRecordOne, doctorID } = req.body

    if( !pToken || !pID || !patientName || !address || !mobileNumber || !deceaseRecordOne || !medicineRecordOne || !Array.isArray(doctorID) || !doctorID.length) {
        return res.status(400).json({
            message: 'All fields are required'
        })
    }


    // const patient = await Patient.findById(id).exec()
    const patient = await Patient.findOne({ pToken }).exec()
    console.log(patient)

    if(!patient) {
        return res.status(400).json({ message: 'Patient not found' })
    }

    const duplicateID = await Patient.findOne({ pToken }).lean().exec()

    if(duplicateID && duplicateID?._id.toString() !== id) {
        return res.status(409).json({
            message: 'Duplicate ID'
        })
    }

     const duplicateEmail = await Patient.findOne({ pID }).lean().exec()

     if(duplicateEmail && duplicateEmail?._id.toString() !== id) {
         return res.status(409).json({
             message: 'Duplicate Email ID'
         })
     }
    
    patient.pID = pID
    patient.patientName = patientName
    patient.address = address
    patient.mobileNumber = mobileNumber
    patient.deceaseRecordOne = deceaseRecordOne
    patient.medicineRecordOne = medicineRecordOne
    patient.doctorID = doctorID

    await patient.save()

    res.json({
        message: `${patient.patientName} with token ${patient.pToken} & id ${patient.id} updated`
    })
})


// @route DELETE/patients
const deletePatient = asyncHandler(async (req, res) => {
    const { pToken } = req.body

    if(!pToken) {
        return res.status(400).json({
            message: 'Token required'
        })
    }   

    const patient = await Patient.findOne({ pToken }).exec()

    if(!patient) {
        return res.status(400).json({
            message: 'Patient not found'
        })
    }

    const result = await patient.deleteOne()

    const reply = `Username ${result.patientName} with token ${patient.pToken} deleted`
9
    res.json(reply)
})


module.exports = {
    getAllPatients,
    createNewPatient,
    updatePatient,
    deletePatient
}



