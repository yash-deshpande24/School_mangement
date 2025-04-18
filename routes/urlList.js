var express = require("express"),
  OAuth2Server = require("oauth2-server"),
  Request = OAuth2Server.Request,
  Response = OAuth2Server.Response;
const router = express.Router();
const multer = require("multer");
const xlsx = require("xlsx");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const adminOauthServer = new OAuth2Server({
  model: require("../oauthServer.js"),
  // accessTokenLifetime: 60 * 60  24, // 1 hr in seconds
  // refreshTokenLifetime: 60 * 60  24, // 1 hr in seconds
  // allowBearerTokensInQueryString: true
});

function adminauthenticaterequest(req, res, next) {
  console.log("Authenticate Request 2");
  var request = new Request(req);
  var response = new Response(res);
  return adminOauthServer
    .authenticate(request, response)
    .then(function (token) {
      next();
    })
    .catch(function (err) {
      res.status(err.code || 500).json(err);
    });
}

//User
const clearDataOfSchool = require("../controller/client/clearDataOfSchool.js");
router
  .route("/oauth/clearDataOfSchool/:clientId")
  .delete(adminauthenticaterequest, clearDataOfSchool);

const createclient = require("../controller/client/createClient");
router.route("/oauth/createClient").post(createclient);

const getClientDetail = require("../controller/client/getClientDetail");
router.route("/oauth/getClientDetail/:clientId").get(getClientDetail);

const getAccessToken = require("../controller/token/token");
router.route("/oauth/token").post(getAccessToken);

const logoutToken = require("../controller/token/logout");
router.route("/oauth/logout").post(logoutToken);

const registerUser = require("../controller/user/createUser");
router.route("/register").post(registerUser);

const createSuperAdmin = require("../controller/user/createSuperAdmin");
router.route("/createSuperAdmin").post(createSuperAdmin);

const updateUser = require("../controller/user/updateuserInfo");
router.route("/updateUserInfo/:id").put(adminauthenticaterequest, updateUser);

const deleteUser = require("../controller/user/deleteUser");
router
  .route("/deleteUser/:userId")
  .delete(adminauthenticaterequest, deleteUser);

const getAllUser = require("../controller/user/getAllUser");
router.route("/getAllUser").get(adminauthenticaterequest, getAllUser);

const changePassword = require("../controller/user/changePassword");
router.route("/changePassword").post(adminauthenticaterequest, changePassword);

const exportData = require("../controller/user/exportData");
router
  .route("/exportData/:tableName")
  .get(adminauthenticaterequest, exportData);

const importData = require("../controller/user/ImportData");
router.post("/importData/:tableName", upload.single("file"), importData);

const createData = require("../controller/user/CreateData");
router.post("/createData", upload.single("file"), createData);

//School
const addSchool = require("../controller/school/createSchool");
const updateSchoolInfo = require("../controller/school/updateSchoolInfo.js");
const getAllSchool = require("../controller/school/getAllSchool.js");
const getAllSchools = require("../controller/school/getAllSchools.js");
const getAllTeachers = require("../controller/Teacher/getAllTeacher.js");
const deleteSchool = require("../controller/school/deleteSchool.js");
const addSubject = require("../controller/Subject/createSubject.js");
const getAllSubject = require("../controller/Subject/getAllSubject.js");
const getAllParent = require("../controller/Parent/getAllParent.js");
const addFAQ = require("../controller/FAQ/createFAQ.js");
const getFAQ = require("../controller/FAQ/getFAQ.js");
const updateFQA = require("../controller/FAQ/updateFAQ.js");
const deleteFQA = require("../controller/FAQ/deleteFAQ.js");
const addFeeType = require("../controller/Fees/createFeesType.js");
const addFeeStructure = require("../controller/Fees/createFeesStructure.js");
const getAllFeesType = require("../controller/Fees/getFeesType.js");
const getAllFeesStructureByClassId = require("../controller/Fees/getFeesStructureByClassId.js");
const deleteFeesType = require("../controller/Fees/deleteFeesType.js");
const deleteFeesStructure = require("../controller/Fees/deleteFeesStructure.js");
const getAllFeeStructure = require("../controller/Fees/getAllFeeStructure.js");
const updateFeesType = require("../controller/Fees/updateFeesTypeById.js");
const updateFeesStructure = require("../controller/Fees/updateFeesStructureById.js");
const deleteSubject = require("../controller/Subject/deleteSubject.js");
const updateSubject = require("../controller/Subject/updateSubject.js");

router.route("/addSchool").post(adminauthenticaterequest, addSchool);
router
  .route("/updateSchoolInfo/:schoolId")
  .put(adminauthenticaterequest, updateSchoolInfo);
router.route("/getSchool").get(adminauthenticaterequest, getAllSchool);
router.route("/getSchools").get(adminauthenticaterequest, getAllSchools);
router.route("/getTeachers").get(adminauthenticaterequest, getAllTeachers);
router
  .route("/deleteSchool/:clientId")
  .delete(adminauthenticaterequest, deleteSchool);
router.route("/addSubject").post(adminauthenticaterequest, addSubject);
router.route("/getSubject").get(adminauthenticaterequest, getAllSubject);
router.route("/getParent").get(adminauthenticaterequest, getAllParent);
router.route("/addFAQ").post(adminauthenticaterequest, addFAQ);
router.route("/getFAQ").get(adminauthenticaterequest, getFAQ);
router.route("/updateFAQ/:faqid").put(adminauthenticaterequest, updateFQA);
router.route("/deleteFAQ/:faqid").delete(adminauthenticaterequest, deleteFQA);
router.route("/addFeeType").post(adminauthenticaterequest, addFeeType);
router
  .route("/addFeeStructure")
  .post(adminauthenticaterequest, addFeeStructure);
router.route("/getFeesType").get(adminauthenticaterequest, getAllFeesType);
router
  .route("/deleteFeesType/:feeTypeId")
  .delete(adminauthenticaterequest, deleteFeesType);
router
  .route("/deleteFeesStructure/:feeStructureId")
  .delete(adminauthenticaterequest, deleteFeesStructure);
router
  .route("/getFeesStructure/:classId")
  .get(adminauthenticaterequest, getAllFeesStructureByClassId);
router
  .route("/getFeesStructure")
  .get(adminauthenticaterequest, getAllFeeStructure);
router
  .route("/updateFeesType/:id")
  .put(adminauthenticaterequest, updateFeesType);
router
  .route("/updateFeesStructure/:id")
  .put(adminauthenticaterequest, updateFeesStructure);
router
  .route("/deleteSubject/:subjectId")
  .delete(adminauthenticaterequest, deleteSubject);
router
  .route("/updateSubject/:subjectId")
  .put(adminauthenticaterequest, updateSubject);

//Student
const createStudent = require("../controller/Student/createStudent.js");
router.route("/createStudent").post(adminauthenticaterequest, createStudent);

const deleteParentWithStudent = require("../controller/Student/deleteParentWithStudent.js");
router
  .route("/deleteParentWithStudent/:studentId/:parentId")
  .delete(adminauthenticaterequest, deleteParentWithStudent);

const assignParentWithStudent = require("../controller/Student/assignParentWithStudent.js");
router
  .route("/assignParentWithStudent/:parentId/:studentId")
  .post(adminauthenticaterequest, assignParentWithStudent);

const assignSectionToStudent = require("../controller/Student/assignSectionToStudent.js");
router
  .route("/assignSectionToStudent/:studentId/:classId/:sectionId")
  .put(adminauthenticaterequest, assignSectionToStudent);

const getAllStudent = require("../controller/Student/getAllStudent.js");
router.route("/getAllStudents").get(adminauthenticaterequest, getAllStudent);

const getStudentByClassAndSection = require("../controller/Student/getStudentByClassAndSection.js");
router
  .route("/getStudentByClassAndSection/:classId/:sectionId")
  .get(adminauthenticaterequest, getStudentByClassAndSection);

const getSchoolStudentByName = require("../controller/Student/getSchoolStudentByName.js");
router
  .route("/getAllStudents/:name")
  .get(adminauthenticaterequest, getSchoolStudentByName);

const getStudentsOfClassByStudentName = require("../controller/Student/getStudentOfClassByStudentName.js");
router
  .route("/getStudentsOfClassByStudentName/:studentName")
  .get(adminauthenticaterequest, getStudentsOfClassByStudentName);

const getStudentsFromSchoolParentStudent = require("../controller/Student/getStudentsFromSchoolParentStudent.js");
router
  .route("/getStudentsBySchool")
  .get(adminauthenticaterequest, getStudentsFromSchoolParentStudent);

const getStudentById = require("../controller/Student/getStudentById.js");
router
  .route("/getStudentById/:studentId")
  .get(adminauthenticaterequest, getStudentById);

const getStudentByIdInArray = require("../controller/Student/getStudentByIDInArray.js");
router
  .route("/getStudentByIdInArray/:studentId")
  .get(adminauthenticaterequest, getStudentByIdInArray);

const getStudentOfClassByClassId = require("../controller/Student/getStudentOfClassByClassId.js");
router
  .route("/getStudentOfClassByClassId/:classId")
  .get(adminauthenticaterequest, getStudentOfClassByClassId);

const getStudentOfClassByClassName = require("../controller/Student/getStudentsOfClassByClassName.js");
router
  .route("/getStudentOfClassByClassName/:className")
  .get(adminauthenticaterequest, getStudentOfClassByClassName);

const updateStudent = require("../controller/Student/updateStudent.js");
router
  .route("/updateStudent/:studentId")
  .put(adminauthenticaterequest, updateStudent);

// Classes
const createClass = require("../controller/classes/createClass");
const getClasses = require("../controller/classes/getAllClasses.js");
const assignTeacherToClass = require("../controller/classes/assignSubjectAndTeacherToClass.js");
const getTeachersOfClass = require("../controller/Teacher/getTeachersOfClass.js");
const getStudentsOfClassByName = require("../controller/Student/getStudentsOfClassByClassName.js");
const getStudentsOfByClassId = require("../controller/Student/getStudentOfClassByClassId.js");
const studentEnrollmentInClass = require("../controller/classes/classEnrollments.js");
const multipleStudentEnrollmentInClass = require("../controller/classes/enrollMultipleStudentInClass.js");
const updateClass = require("../controller/classes/updateClass.js");
const deleteClass = require("../controller/classes/deleteClass.js");
const getSchoolTeacherByName = require("../controller/Teacher/getSchoolTeacherByName.js");
const getAllClassesWithTheirSections = require("../controller/classes/getClassesWithTheirSections.js");
const getAllClassesWithTeacherAndSubject = require("../controller/classes/getAllClassesWithTeacherAndSubject.js");
const updateAssociationClassTeacherAndSubject = require("../controller/classes/updateAssociationClassTeacherAndSubject.js");

router
  .route("/getSchoolTeacherByName/:name")
  .get(adminauthenticaterequest, getSchoolTeacherByName);
router.route("/createClass").post(adminauthenticaterequest, createClass);
router.route("/getClasses").get(adminauthenticaterequest, getClasses);
router
  .route("/assignSubjectAndTeacherToClass/:classId/:subjectId/:teacherId")
  .post(adminauthenticaterequest, assignTeacherToClass);
router
  .route("/getTeachersOfClass/:className")
  .get(adminauthenticaterequest, getTeachersOfClass);
router
  .route("/getStudentsOfClassByName/:className")
  .get(adminauthenticaterequest, getStudentsOfClassByName);
router
  .route("/getStudentsOfByClassId/:classId")
  .get(adminauthenticaterequest, getStudentsOfByClassId);
router
  .route("/studentEnrollmentInClass/:studentId/:classId/:sectionId")
  .post(adminauthenticaterequest, studentEnrollmentInClass);
router
  .route("/multipleStudentEnrollmentInClass/:classId")
  .post(adminauthenticaterequest, multipleStudentEnrollmentInClass);
router
  .route("/updateClass/:classId")
  .put(adminauthenticaterequest, updateClass);
router
  .route("/deleteClass/:classId")
  .delete(adminauthenticaterequest, deleteClass);
router
  .route("/getAllClassesWithTheirSections")
  .get(adminauthenticaterequest, getAllClassesWithTheirSections);
router
  .route("/getAllClassesWithTeacherAndSubject")
  .get(adminauthenticaterequest, getAllClassesWithTeacherAndSubject);
router
  .route("/updateAssociationClassTeacherAndSubject/:id/:teacherId/:subjectId")
  .put(adminauthenticaterequest, updateAssociationClassTeacherAndSubject);

// Departments

const createDepartment = require("../controller/department/createDepartment");
const getDepartment = require("../controller/department/getDepartments.js");
const deleteDepartment = require("../controller/department/deleteDepartment.js");
const updateDepartment = require("../controller/department/updateDepartment.js");
const deleteMultipleDepartments = require("../controller/department/deleteMultipleDepartments.js");

router
  .route("/createDepartment")
  .post(adminauthenticaterequest, createDepartment);
router.route("/getDepartment").get(adminauthenticaterequest, getDepartment);
router
  .route("/deleteDepartment/:departmentId")
  .delete(adminauthenticaterequest, deleteDepartment);
router
  .route("/updateDepartment/:departmentId")
  .put(adminauthenticaterequest, updateDepartment);
router
  .route("/deleteMultipleDepartment")
  .delete(adminauthenticaterequest, deleteMultipleDepartments);

//Attendance
const addAttendance = require("../controller/Attendance/addAttendance.js");
router.route("/addAttendance").post(adminauthenticaterequest, addAttendance);

const getAttendanceByClass = require("../controller/Attendance/getAttendanceByClass.js");
router
  .route("/getAttendanceByClasss/:classId")
  .get(adminauthenticaterequest, getAttendanceByClass);

const getAttendanceByDate = require("../controller/Attendance/getAttendanceByDate.js");
router
  .route("/getAttendanceByDate/:date")
  .get(adminauthenticaterequest, getAttendanceByDate);

const getAttendaceByClassAndSection = require("../controller/Attendance/getAttendanceByClassAndSectionAndDate.js");
router
  .route("/getAttendaceByClassAndSection")
  .get(adminauthenticaterequest, getAttendaceByClassAndSection);

const getAttendanceByStudent = require("../controller/Attendance/getAttendanceByStudentId.js");
router
  .route("/getAttendanceByStudent/:studentId")
  .get(adminauthenticaterequest, getAttendanceByStudent);

//Notice
const addNotice = require("../controller/Notices/createNotice.js");
const getNotices = require("../controller/Notices/getUserNotice.js");
const getNoticeCreatedByAdmin = require("../controller/Notices/getNoticeCreatedByAdmin.js");
const updateNoticeById = require("../controller/Notices/updateNoticeById.js");
const deleteNoticeById = require("../controller/Notices/deleteNoticeById.js");
const getAdminNotice = require("../controller/Notices/getAdminNotice.js");

router.route("/createNotice").post(adminauthenticaterequest, addNotice);
router.route("/getNotices").get(adminauthenticaterequest, getNotices);
router
  .route("/getNoticeCreatedByAdmin")
  .get(adminauthenticaterequest, getNoticeCreatedByAdmin);
router
  .route("/updateNoticeById/:noticeId")
  .put(adminauthenticaterequest, updateNoticeById);
router
  .route("/deleteNoticeById/:noticeId")
  .delete(adminauthenticaterequest, deleteNoticeById);
router.route("/getAdminNotice").get(adminauthenticaterequest, getAdminNotice);

const getParentByStudentId = require("../controller/Parent/getParentByStudentID.js");
const getTeacherByClassName = require("../controller/Teacher/getTeacherByClassName.js");
const getTeacherByName = require("../controller/Teacher/getTeacherByName.js");
const getTeacherById = require("../controller/Teacher/getTeacherById.js");
const createIncidentComplaint = require("../controller/Parent/incidentController.js");

router
  .route("/getParentByStudentId/:studentId")
  .get(adminauthenticaterequest, getParentByStudentId);
router
  .route("/getTeacherByClassName/:className")
  .get(adminauthenticaterequest, getTeacherByClassName);
router
  .route("/getTeachers/:name")
  .get(adminauthenticaterequest, getTeacherByName);
router
  .route("/getTeacherById/:teacherId")
  .get(adminauthenticaterequest, getTeacherById);
router
  .route("/incidentController")
  .post(adminauthenticaterequest, createIncidentComplaint);

//Payment

const createPayment = require("../controller/payment/createPayment.js");
const getAllPayment = require("../controller/payment/getAllPayment.js");
const getAllPendingFees = require("../controller/payment/getAllPendingFees.js");
const getPaymentByStudentId = require("../controller/payment/getPaymentByStudentId.js");
const getAllPendingFeesByStudentId = require("../controller/payment/getAllPendingFeesByStudentId.js");
const updatePaymentByStudentIdandFeeId = require("../controller/payment/updatePaymentByStudentIdandFeesId.js");
const updatePendingFeesByStudentIdandFeeId = require("../controller/payment/updatePendingFeesByStudentIdandFeeId.js");
const deletePayment = require("../controller/payment/deletePayment.js");
const deletePendingFees = require("../controller/payment/deletePendingFees.js");
const getPaymentDetailOfStudent = require("../controller/payment/getPaymentDetailOfStudent.js");
const filterFeesByClass = require("../controller/payment/filterFeesByClassID.js");
const filterFeesByClassAndSectionID = require("../controller/payment/filterFeesByClassAndSectionID.js");
const FilterFeesByName = require("../controller/payment/filterFeesByName.js");
const filterFeesByID = require("../controller/payment/filterFeesByStudentID.js");
const getAllPaymentByStudentID = require("../controller/payment/getAllPaymentByStudentID.js");

const filterPendingFeesByName = require("../controller/payment/filterPendingFeesByName.js");
const filterPendingFeesByClassID = require("../controller/payment/filterPendingFeesByClassID.js");
const filterPendingFeesByClassAndSectionID = require("../controller/payment/filterPendingFeesByClassAndSectionID.js");
const filterPendingFeesByStudentID = require("../controller/payment/filterPendingFeesByStudentID.js");

router
  .route("/createPayment/:studentId")
  .post(adminauthenticaterequest, createPayment);
router.route("/getAllPayment").get(adminauthenticaterequest, getAllPayment);
router
  .route("/getAllPendingFees")
  .get(adminauthenticaterequest, getAllPendingFees);
router
  .route("/getPaymentByStudentId/:studentId")
  .get(adminauthenticaterequest, getPaymentByStudentId);
router
  .route("/getPendingFeesByStudentId/:studentId")
  .get(adminauthenticaterequest, getAllPendingFeesByStudentId);
router
  .route("/updatePaymentByStudentIdandFeeId/:studentId/:feesId")
  .put(adminauthenticaterequest, updatePaymentByStudentIdandFeeId);
router
  .route("/updatePendingFeesByStudentIdandFeeId/:studentId/:feesId")
  .put(adminauthenticaterequest, updatePendingFeesByStudentIdandFeeId);
router
  .route("/deletePayment/:paymentId")
  .delete(adminauthenticaterequest, deletePayment);
router
  .route("/deletePendingFees/:id")
  .delete(adminauthenticaterequest, deletePendingFees);
router
  .route("/getPaymentDetailOfStudent/:studentId")
  .get(adminauthenticaterequest, getPaymentDetailOfStudent);
// router.route('/filterFees/:classID').get(adminauthenticaterequest,filterFeesByClass);
// router.route('/filterFees/:classID/:sectionID').get(adminauthenticaterequest,filterFeesByClassAndSectionID);
// router.route('/filterFees/:name').get(adminauthenticaterequest,FilterFeesByName);
// router.route('/filterFees/:studentID').get(adminauthenticaterequest,filterFeesByID);
router
  .route("/getAllPaymentByStudentID/:studentId")
  .get(adminauthenticaterequest, getAllPaymentByStudentID);

// router.route('/getAllPendingFees/:name').get(adminauthenticaterequest,filterPendingFeesByName);
// router.route('/getAllPendingFees/:classID').get(adminauthenticaterequest,filterPendingFeesByClassID);
// router.route('/getAllPendingFees/:classID/:sectionID').get(adminauthenticaterequest,filterPendingFeesByClassAndSectionID);
router
  .route("/filterPendingFees")
  .get(adminauthenticaterequest, filterPendingFeesByStudentID);

const fileController = require("../controller/school/logoUpload.js");
router.post(
  "/upload",
  fileController.uploadMiddleware,
  fileController.fileUpload
);

//Section
const createSection = require("../controller/Section/createSection.js");
const getAllSectionOfClass = require("../controller/Section/getAllSectionOfClass.js");
const updateSection = require("../controller/Section/updateSectionById.js");
const deleteSection = require("../controller/Section/deleteSection.js");

router.route("/createSection").post(adminauthenticaterequest, createSection);
router
  .route("/getAllSectionOfClass/:classId")
  .get(adminauthenticaterequest, getAllSectionOfClass);
router
  .route("/updateSection/:sectionId")
  .put(adminauthenticaterequest, updateSection);
router
  .route("/deleteSection/:sectionId")
  .delete(adminauthenticaterequest, deleteSection);

//Add Faculty attendance
const getWiFiDetail = require("../controller/FacultyAttendance/getWiFiDetails.js");
router.route("/getWiFiDetail").get(adminauthenticaterequest, getWiFiDetail);

const addUpdateWiFiDetail = require("../controller/FacultyAttendance/addUpdateWiFiDetail.js");
router.route("/addUpdateWiFiDetail").post(adminauthenticaterequest, addUpdateWiFiDetail);

const addFacultyAttendance = require("../controller/FacultyAttendance/addFacultyAttendance.js");
router.route("/addFacultyAttendance").post(adminauthenticaterequest, addFacultyAttendance);

const getFacultyAttendance = require("../controller/FacultyAttendance/getFacultyAttendance.js");
router.route("/getFacultyAttendance").get(adminauthenticaterequest, getFacultyAttendance);

const getAllFacultyAttendance = require("../controller/FacultyAttendance/getAllFacultyAttendance.js");
router.route("/getAllFacultyAttendance/:month").get(adminauthenticaterequest, getAllFacultyAttendance);

const filterAttendanceByDate = require("../controller/FacultyAttendance/filterFacultyAttendanceByDate.js");
router.route("/filterFacultyAttendance").get(adminauthenticaterequest, filterAttendanceByDate);

const filterAttendanceByDateForAdminView = require("../controller/FacultyAttendance/filterAllFacultyAttendanceByDate.js");
router.route("/filterAllFacultyAttendance").get(adminauthenticaterequest, filterAttendanceByDateForAdminView);

const isClockInExist = require("../controller/FacultyAttendance/isClockInExist.js");
router.route("/isClockInExist").get(adminauthenticaterequest, isClockInExist);

const addFacultyAttendanceByAdmin = require("../controller/FacultyAttendance/addFacultyAttendanceByAdmin.js");
router.route("/addFacultyAttendanceByAdmin").post(adminauthenticaterequest, addFacultyAttendanceByAdmin);

const deleteFacultyAttendanceByAdmin = require("../controller/FacultyAttendance/deleteFacultyAttendanceByAdmin.js");
router.route("/deleteFacultyAttendanceByAdmin/:attendanceId").delete(adminauthenticaterequest, deleteFacultyAttendanceByAdmin);

const removeFacultyClockoutByAdmin = require("../controller/FacultyAttendance/removeFacultyClockoutByAdmin.js");
router.route("/removeFacultyClockoutByAdmin/:attendanceId").delete(adminauthenticaterequest, removeFacultyClockoutByAdmin);

module.exports = router;
