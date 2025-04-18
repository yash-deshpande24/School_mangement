var DataTypes = require("sequelize").DataTypes;
var _Attendance = require("./Attendance");
var _BankDetail = require("./BankDetail");
var _ClassEnrollments = require("./ClassEnrollments");
var _ClassSchedules = require("./ClassSchedules");
var _Classes = require("./Classes");
var _Department = require("./Department");
var _Document = require("./Document");
var _FacultyAttendance = require("./FacultyAttendance");
var _FacultyLeaveDetails = require("./FacultyLeaveDetails");
var _FeeStructure = require("./FeeStructure");
var _FeeType = require("./FeeType");
var _ImageType = require("./ImageType");
var _ImagesReference = require("./ImagesReference");
var _IncidentComplaint = require("./IncidentComplaint");
var _NoticeDetail = require("./NoticeDetail");
var _Notices = require("./Notices");
var _OAuthClient = require("./OAuthClient");
var _OAuthToken = require("./OAuthToken");
var _Payment = require("./Payment");
var _PendingFees = require("./PendingFees");
var _SchoolFAQ = require("./SchoolFAQ");
var _SchoolInfo = require("./SchoolInfo");
var _SchoolParentStudent = require("./SchoolParentStudent");
var _Section = require("./Section");
var _StudentAttendance = require("./StudentAttendance");
var _Subjects = require("./Subjects");
var _TeacherDepartmentAssociation = require("./TeacherDepartmentAssociation");
var _TransactionType = require("./TransactionType");
var _UserInfo = require("./UserInfo");
var _UserRole = require("./UserRole");
var _WifiDetail = require("./WifiDetail");

function initModels(sequelize) {
  var Attendance = _Attendance(sequelize, DataTypes);
  var BankDetail = _BankDetail(sequelize, DataTypes);
  var ClassEnrollments = _ClassEnrollments(sequelize, DataTypes);
  var ClassSchedules = _ClassSchedules(sequelize, DataTypes);
  var Classes = _Classes(sequelize, DataTypes);
  var Department = _Department(sequelize, DataTypes);
  var Document = _Document(sequelize, DataTypes);
  var FacultyAttendance = _FacultyAttendance(sequelize, DataTypes);
  var FacultyLeaveDetails = _FacultyLeaveDetails(sequelize, DataTypes);
  var FeeStructure = _FeeStructure(sequelize, DataTypes);
  var FeeType = _FeeType(sequelize, DataTypes);
  var ImageType = _ImageType(sequelize, DataTypes);
  var ImagesReference = _ImagesReference(sequelize, DataTypes);
  var IncidentComplaint = _IncidentComplaint(sequelize, DataTypes);
  var NoticeDetail = _NoticeDetail(sequelize, DataTypes);
  var Notices = _Notices(sequelize, DataTypes);
  var OAuthClient = _OAuthClient(sequelize, DataTypes);
  var OAuthToken = _OAuthToken(sequelize, DataTypes);
  var Payment = _Payment(sequelize, DataTypes);
  var PendingFees = _PendingFees(sequelize, DataTypes);
  var SchoolFAQ = _SchoolFAQ(sequelize, DataTypes);
  var SchoolInfo = _SchoolInfo(sequelize, DataTypes);
  var SchoolParentStudent = _SchoolParentStudent(sequelize, DataTypes);
  var Section = _Section(sequelize, DataTypes);
  var StudentAttendance = _StudentAttendance(sequelize, DataTypes);
  var Subjects = _Subjects(sequelize, DataTypes);
  var TeacherDepartmentAssociation = _TeacherDepartmentAssociation(sequelize, DataTypes);
  var TransactionType = _TransactionType(sequelize, DataTypes);
  var UserInfo = _UserInfo(sequelize, DataTypes);
  var UserRole = _UserRole(sequelize, DataTypes);
  var WifiDetail = _WifiDetail(sequelize, DataTypes);

  Classes.belongsToMany(UserInfo, { as: 'studentId_UserInfos', through: ClassEnrollments, foreignKey: "classId", otherKey: "studentId" });
  UserInfo.belongsToMany(Classes, { as: 'classId_Classes', through: ClassEnrollments, foreignKey: "studentId", otherKey: "classId" });
  Attendance.belongsTo(Classes, { as: "class", foreignKey: "classId"});
  Classes.hasMany(Attendance, { as: "Attendances", foreignKey: "classId"});
  ClassEnrollments.belongsTo(Classes, { as: "class", foreignKey: "classId"});
  Classes.hasMany(ClassEnrollments, { as: "ClassEnrollments", foreignKey: "classId"});
  ClassSchedules.belongsTo(Classes, { as: "class", foreignKey: "classId"});
  Classes.hasMany(ClassSchedules, { as: "ClassSchedules", foreignKey: "classId"});
  FeeStructure.belongsTo(Classes, { as: "Class", foreignKey: "ClassID"});
  Classes.hasMany(FeeStructure, { as: "FeeStructures", foreignKey: "ClassID"});
  Payment.belongsTo(Classes, { as: "class", foreignKey: "classID"});
  Classes.hasMany(Payment, { as: "Payments", foreignKey: "classID"});
  PendingFees.belongsTo(Classes, { as: "class", foreignKey: "classID"});
  Classes.hasMany(PendingFees, { as: "PendingFees", foreignKey: "classID"});
  TeacherDepartmentAssociation.belongsTo(Department, { as: "department", foreignKey: "departmentId"});
  Department.hasMany(TeacherDepartmentAssociation, { as: "TeacherDepartmentAssociations", foreignKey: "departmentId"});
  Payment.belongsTo(FeeStructure, { as: "Fee", foreignKey: "FeeID"});
  FeeStructure.hasMany(Payment, { as: "Payments", foreignKey: "FeeID"});
  PendingFees.belongsTo(FeeStructure, { as: "Fee", foreignKey: "FeeID"});
  FeeStructure.hasMany(PendingFees, { as: "PendingFees", foreignKey: "FeeID"});
  FeeStructure.belongsTo(FeeType, { as: "FeeType", foreignKey: "FeeTypeID"});
  FeeType.hasMany(FeeStructure, { as: "FeeStructures", foreignKey: "FeeTypeID"});
  ImagesReference.belongsTo(ImageType, { as: "imageType_ImageType", foreignKey: "imageType"});
  ImageType.hasMany(ImagesReference, { as: "ImagesReferences", foreignKey: "imageType"});
  NoticeDetail.belongsTo(Notices, { as: "notice", foreignKey: "noticeId"});
  Notices.hasMany(NoticeDetail, { as: "NoticeDetails", foreignKey: "noticeId"});
  NoticeDetail.belongsTo(OAuthClient, { as: "client", foreignKey: "clientId"});
  OAuthClient.hasMany(NoticeDetail, { as: "NoticeDetails", foreignKey: "clientId"});
  TeacherDepartmentAssociation.belongsTo(OAuthClient, { as: "client", foreignKey: "clientId"});
  OAuthClient.hasMany(TeacherDepartmentAssociation, { as: "TeacherDepartmentAssociations", foreignKey: "clientId"});
  WifiDetail.belongsTo(OAuthClient, { as: "client", foreignKey: "clientId"});
  OAuthClient.hasMany(WifiDetail, { as: "WifiDetails", foreignKey: "clientId"});
  SchoolFAQ.belongsTo(SchoolInfo, { as: "school", foreignKey: "schoolId"});
  SchoolInfo.hasMany(SchoolFAQ, { as: "SchoolFAQs", foreignKey: "schoolId"});
  SchoolParentStudent.belongsTo(SchoolInfo, { as: "school", foreignKey: "schoolId"});
  SchoolInfo.hasMany(SchoolParentStudent, { as: "SchoolParentStudents", foreignKey: "schoolId"});
  ClassEnrollments.belongsTo(Section, { as: "section", foreignKey: "sectionId"});
  Section.hasMany(ClassEnrollments, { as: "ClassEnrollments", foreignKey: "sectionId"});
  Payment.belongsTo(Section, { as: "section", foreignKey: "sectionID"});
  Section.hasMany(Payment, { as: "Payments", foreignKey: "sectionID"});
  PendingFees.belongsTo(Section, { as: "section", foreignKey: "sectionID"});
  Section.hasMany(PendingFees, { as: "PendingFees", foreignKey: "sectionID"});
  Classes.belongsTo(Subjects, { as: "subject", foreignKey: "subjectId"});
  Subjects.hasMany(Classes, { as: "Classes", foreignKey: "subjectId"});
  Attendance.belongsTo(UserInfo, { as: "student", foreignKey: "studentId"});
  UserInfo.hasMany(Attendance, { as: "Attendances", foreignKey: "studentId"});
  Attendance.belongsTo(UserInfo, { as: "teacher", foreignKey: "teacherId"});
  UserInfo.hasMany(Attendance, { as: "teacher_Attendances", foreignKey: "teacherId"});
  BankDetail.belongsTo(UserInfo, { as: "userInfo", foreignKey: "userInfoID"});
  UserInfo.hasMany(BankDetail, { as: "BankDetails", foreignKey: "userInfoID"});
  ClassEnrollments.belongsTo(UserInfo, { as: "student", foreignKey: "studentId"});
  UserInfo.hasMany(ClassEnrollments, { as: "ClassEnrollments", foreignKey: "studentId"});
  Classes.belongsTo(UserInfo, { as: "teacher", foreignKey: "teacherId"});
  UserInfo.hasMany(Classes, { as: "Classes", foreignKey: "teacherId"});
  Document.belongsTo(UserInfo, { as: "userInfo", foreignKey: "userInfoID"});
  UserInfo.hasMany(Document, { as: "Documents", foreignKey: "userInfoID"});
  FacultyAttendance.belongsTo(UserInfo, { as: "user", foreignKey: "userId"});
  UserInfo.hasMany(FacultyAttendance, { as: "FacultyAttendances", foreignKey: "userId"});
  ImagesReference.belongsTo(UserInfo, { as: "user", foreignKey: "userId"});
  UserInfo.hasMany(ImagesReference, { as: "ImagesReferences", foreignKey: "userId"});
  Notices.belongsTo(UserInfo, { as: "posted_by_UserInfo", foreignKey: "posted_by"});
  UserInfo.hasMany(Notices, { as: "Notices", foreignKey: "posted_by"});
  Payment.belongsTo(UserInfo, { as: "Student", foreignKey: "StudentID"});
  UserInfo.hasMany(Payment, { as: "Payments", foreignKey: "StudentID"});
  PendingFees.belongsTo(UserInfo, { as: "Student", foreignKey: "StudentID"});
  UserInfo.hasMany(PendingFees, { as: "PendingFees", foreignKey: "StudentID"});
  SchoolParentStudent.belongsTo(UserInfo, { as: "parent", foreignKey: "parentId"});
  UserInfo.hasMany(SchoolParentStudent, { as: "SchoolParentStudents", foreignKey: "parentId"});
  SchoolParentStudent.belongsTo(UserInfo, { as: "student", foreignKey: "studentId"});
  UserInfo.hasMany(SchoolParentStudent, { as: "student_SchoolParentStudents", foreignKey: "studentId"});
  TeacherDepartmentAssociation.belongsTo(UserInfo, { as: "teacher", foreignKey: "teacherId"});
  UserInfo.hasMany(TeacherDepartmentAssociation, { as: "TeacherDepartmentAssociations", foreignKey: "teacherId"});

  return {
    Attendance,
    BankDetail,
    ClassEnrollments,
    ClassSchedules,
    Classes,
    Department,
    Document,
    FacultyAttendance,
    FacultyLeaveDetails,
    FeeStructure,
    FeeType,
    ImageType,
    ImagesReference,
    IncidentComplaint,
    NoticeDetail,
    Notices,
    OAuthClient,
    OAuthToken,
    Payment,
    PendingFees,
    SchoolFAQ,
    SchoolInfo,
    SchoolParentStudent,
    Section,
    StudentAttendance,
    Subjects,
    TeacherDepartmentAssociation,
    TransactionType,
    UserInfo,
    UserRole,
    WifiDetail,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
