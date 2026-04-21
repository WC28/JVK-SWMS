export const priorityOptions = ["Low", "Medium", "High"] as const;
export const statusOptions = ["In progress", "D/C", "LATE", "WAIT D/C"] as const;
export const intakeOptions = [
  "OPD",
  "IPD",
  "OPD เด็ก",
  "ER",
  "นิติจิตเวช OPD",
  "นิติจิตเวช IPD"
] as const;
export const sexOptions = ["Male", "Female"] as const;

export const swOptions = [
  "คุณศิริพร",
  "คุณกิตติมาพร",
  "คุณนัทธมน",
  "คุณสุภาภรณ์",
  "คุณพงศธร",
  "คุณกนกวรรณ",
  "คุณจุฑาพร",
  "คุณวิฏฐิรษา"
] as const;

export const problemOptions = [
  "สุราและยาเสพติด",
  "สถานการณ์บุคคลเป็นอุปสรรคต่อการดูแลตัวเอง",
  "สัมพันธภาพในครอบครัว",
  "ผู้ดูแล",
  "เศรษฐกิจ/อาชีพ",
  "ชุมชนหวาดกลัว",
  "OSCC",
  "สถานสงเคราะห์/ที่อยู่อาศัย",
  "ประเมินความพิการทางจิตหรือพฤติกรรม ทร.14",
  "สงเคราะห์ค่าเดินทางกลับภูมิลำเนา",
  "S1MO",
  "ประเมินส่งผู้ป่วยกลับบ้าน",
  "นิติจิตเวช"
] as const;

export const wardOptions = [
  "ชัยพฤกษ์",
  "พวงชมพู",
  "พุทธรักษา",
  "พิรุณทอง",
  "กรองจิต",
  "OPD เด็ก",
  "ER",
  "OPD",
  "นิติจิตเวช OPD",
  "นิติจิตเวช IPD",
  "ทองอุไร",
  "เฟื่องฟ้า"
] as const;

export const mdOptions = [
  "นพ.รัฐพล",
  "พญ.ภรฑิตา",
  "พญ.กานต์ธิมา",
  "พญ.อัญชลี",
  "พญ.รวิสุดา",
  "นพ.ปวริศร",
  "พญ.เวธนี",
  "นพ.ณฐกร",
  "พญ.สายสุดา",
  "พญ.กรองกาญจน์",
  "นพ.ภัทรพล"
] as const;

export const interventionOptions = [
  "Fact Finding/วินิจฉัยปัญหาทางสังคม",
  "EMR/HPI",
  "Terminate Case",
  "นัดต่อ F/U OPD",
  "รอพบ PT. พบ Pt. แล้ว",
  "รอผลIn-Chart",
  "พบญาติ วัน D/C",
  "Conference Case",
  "ปรึกษาแพทย์",
  "ประสาน รพ.สต",
  "ประสาน อบต",
  "ประสาน พมจ.",
  "ประสานศูนย์คุ้มฯ",
  "ประสานโรงเรียน",
  "ประสานญาติ",
  "ประเมินผู้พิการ ทร.14",
  "ต่อบัตรพิการ",
  "ทำบัตรใหม่",
  "PASS",
  "FAIL",
  "นัดรับเอกสาร",
  "Observed SW",
  "D/C",
  "สงเคราะห์ค่าเดินทาง",
  "Next F/U OPD",
  "wait D/C",
  "ประสานชุมชน",
  "Admit",
  "ส่งต่อ SW IPD",
  "นัดต่อ SW เจ้าของเคสคุณ",
  "เข้าตึกครบ 5 วัน",
  "รอเข้าตึก",
  "ทำเคสแทนคุณ",
  "รอผลเยี่ยมบ้าน/เครือข่าย",
  "มี Order D/C",
  "ให้คำปรึกษาเฉพาะรายบุคคล",
  "บำบัดทางสังคม(ผู้ป่วย)",
  "บำบัดทางสังคม(ญาติ)",
  "บำบัดทางสังคม(กลุ่ม)",
  "บำบัดทางสังคม(ครอบครัว/คู่สมรส)",
  "ฟื้นฟูสมรรถภาพทางสังคม(บุคคล)",
  "ฟื้นฟูสมรรถภาพทางสังคม(กลุ่ม)",
  "ศิริพร",
  "กิตติมาพร",
  "นัทธมน",
  "สุภาภรณ์",
  "พงศธร",
  "กนกวรรณ",
  "จุฑาพร",
  "วิฏฐิรษา",
  "หนังสือเยี่ยมบ้าน",
  "หนังสือขออนุเคราะห์ F/U after D/C",
  "หนังสือถึงอบต.",
  "หนังสือขอถุงยังชีพ",
  "สงเคราะห์ถุงยังชีพ",
  "หนังสือถึงศูนย์คุ้มครองฯ",
  "หนังสือถึงพมจ.",
  "Refer",
  "Late 5 days"
] as const;

export const areaOptions = [
  "อ.เมืองนครราชสีมา",
  "บุรีรัมย์",
  "ชัยภูมิ",
  "สุรินทร์",
  "โนนสูง",
  "สูงเนิน",
  "จักราช",
  "โนนไทย",
  "ชุมพวง",
  "ปักธงชัย",
  "บัวลาย",
  "วังน้ำเขียว",
  "ลำทะเมนชัย",
  "บ้านเหลื่อม",
  "ขามทะเลสอ",
  "พระทองคำ",
  "ขามสะแกแสง",
  "ครบุรี",
  "โชคชัย",
  "พิมาย",
  "ปากช่อง",
  "ห้วยแถลง",
  "แก้งสนามนาง",
  "เมืองยาง",
  "เทพารักษ์",
  "เฉลิมพระเกียรติ",
  "เสิงสาง",
  "สีคิ้ว",
  "ด่านขุนทด",
  "บัวใหญ่",
  "หนองบุญนาก",
  "ประทาย",
  "คง",
  "สีดา",
  "โนนแดง",
  "ขอนแก่น",
  "อุดรธานี",
  "เลย",
  "หนองบัวลำภู",
  "หนองคาย",
  "บึงกาฬ",
  "สกลนคร",
  "นครพนม",
  "มุกดาหาร",
  "กาฬสินธุ์",
  "มหาสารคาม",
  "ร้อยเอ็ด",
  "ยโสธร",
  "อำนาจเจริญ",
  "อุบลราชธานี",
  "ศรีสะเกษ",
  "เชียงใหม่",
  "เชียงราย",
  "แม่ฮ่องสอน",
  "ลำพูน",
  "ลำปาง",
  "พะเยา",
  "แพร่",
  "น่าน",
  "อุตรดิตถ์",
  "ตาก",
  "สุโขทัย",
  "พิษณุโลก",
  "พิจิตร",
  "กำแพงเพชร",
  "เพชรบูรณ์",
  "กรุงเทพมหานคร",
  "นนทบุรี",
  "ปทุมธานี",
  "สมุทรปราการ",
  "สมุทรสาคร",
  "สมุทรสงคราม",
  "นครปฐม",
  "พระนครศรีอยุธยา",
  "ลพบุรี",
  "สระบุรี",
  "สิงห์บุรี",
  "อ่างทอง",
  "ชัยนาท",
  "นครสวรรค์",
  "อุทัยธานี",
  "กาญจนบุรี",
  "ราชบุรี",
  "เพชรบุรี",
  "ประจวบคีรีขันธ์",
  "สุพรรณบุรี",
  "ชลบุรี",
  "ระยอง",
  "จันทบุรี",
  "ตราด",
  "ฉะเชิงเทรา",
  "ปราจีนบุรี",
  "สระแก้ว",
  "นครนายก",
  "ชุมพร",
  "ระนอง",
  "สุราษฎร์ธานี",
  "กระบี่",
  "พังงา",
  "ภูเก็ต",
  "นครศรีธรรมราช",
  "ตรัง",
  "สตูล",
  "พัทลุง",
  "สงขลา",
  "ปัตตานี",
  "ยะลา",
  "นราธิวาส"
] as const;

export type CaseFormState = {
  caseNo: string;
  isDone: boolean;
  problemSocialList: string;
  priority: string;
  status: string;
  consultDate: string;
  deadline: string;
  wardEntryDate: string;
  swName: string;
  patientName: string;
  intake: string;
  intakeNo: string;
  sex: string;
  admitDate: string;
  age: string;
  hn: string;
  dx: string;
  ward: string;
  area: string;
  mdName: string;
  interventionPlan: string[];
  dcDate: string;
  isDcDone: boolean;
  followupDate: string;
  isFuDone: boolean;
  note: string;
};

export const defaultCaseForm: CaseFormState = {
  caseNo: "",
  isDone: false,
  problemSocialList: problemOptions[0],
  priority: priorityOptions[1],
  status: statusOptions[0],
  consultDate: "",
  deadline: "",
  wardEntryDate: "",
  swName: swOptions[0],
  patientName: "",
  intake: intakeOptions[0],
  intakeNo: "",
  sex: sexOptions[0],
  admitDate: "",
  age: "",
  hn: "",
  dx: "",
  ward: wardOptions[0],
  area: areaOptions[0],
  mdName: mdOptions[0],
  interventionPlan: [] as string[],
  dcDate: "",
  isDcDone: false,
  followupDate: "",
  isFuDone: false,
  note: ""
};
