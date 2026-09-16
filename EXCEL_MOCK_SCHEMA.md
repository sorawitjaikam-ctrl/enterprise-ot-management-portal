# รูปแบบตาราง Excel สำหรับโครงสร้างแบบ "INTER 2"

สำหรับผังหน้างานลักษณะนี้ (1 ตำแหน่งมีพนักงานครองหลายคน แบ่งเป็น 3 สายงานหลัก) คุณสามารถจัดทำตารางใน Excel ได้ **2 รูปแบบ** ตามความสะดวกของฝ่าย HR ดังนี้ครับ:

---

### แบบที่ 1: รายชื่อพนักงานทีละคน (Employee Roster) — **แนะนำที่สุด**
บันทึก 1 แถว = พนักงาน 1 คน (หรือถ้าเป็นกรอบว่าง ให้ใส่ชื่อเป็น `[Vacant]` หรือปล่อยว่าง)

| Emp_ID | Full_Name | Position_Title | Wing_Discipline | Status | Reports_To_Role |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **EMP-001** | นายประสิทธิ์ ภักดีชน | ผู้จัดการแผนก | Management | Active | - |
| **EMP-002** | นายเกรียงไกร มั่นคง | Operation Engineer | Management | Active | ผู้จัดการแผนก |
| **EMP-003** | นายธีระศักดิ์ วงศ์ไทย | O&M Specialist | O&M | Active | Operation Engineer |
| **EMP-004** | นายปกรณ์ เจริญทรัพย์ | O&M Specialist | O&M | Active | Operation Engineer |
| **EMP-005** | นายสมเกียรติ สดใส | O&M Generator | O&M | Active | O&M Specialist |
| **EMP-006** | นายมานพ ชัยชนะ | O&M Generator | O&M | Active | O&M Specialist |
| **EMP-007** | นายอำนาจ พลังดี | O&M Generator | O&M | Active | O&M Specialist |
| **EMP-008** | นายเอกชัย กล้าหาญ | O&M Mechanical | O&M | Active | O&M Specialist |
| **EMP-009** | นายสุรพล ธนทรัพย์ | O&M Mechanical | O&M | Active | O&M Specialist |
| **EMP-010** | *(ว่าง / กำลังรับสมัคร)* | O&M Mechanical | O&M | **Vacant** | O&M Specialist |
| **EMP-011** | นายพิพัฒน์ ช่างไฟ | O&M Electrical | O&M | Active | O&M Specialist |
| **EMP-012** | นายณรงค์ ศักดานุภาพ | O&M Electrical | O&M | Active | O&M Specialist |
| **EMP-013** | นายชัยวัฒน์ พิทักษ์ | O&M Electrical | O&M | Active | O&M Specialist |
| **EMP-014** | นายชาญชัย นาวา | ปากเรือ | Operation | Active | Operation Engineer |
| **EMP-015** | นายสมคิด ทะเลทอง | ปากเรือ | Operation | Active | Operation Engineer |
| **EMP-016** | นายศักดา ยอดสิงห์ | ปากเรือ | Operation | Active | Operation Engineer |
| **EMP-017** | นายพงศกร ระเบียบดี | ผู้ควบคุมงานขนถ่ายสินค้า | Operation | Active | Operation Engineer |
| **EMP-018** | นายยุทธนา คุมงาน | ผู้ควบคุมงานขนถ่ายสินค้า | Operation | Active | Operation Engineer |
| **EMP-019** | นายสมหมาย ตรวจเช็ค | ผู้ควบคุมงานขนถ่ายสินค้า | Operation | Active | Operation Engineer |
| **EMP-020** | นายอดิศร ยกของ | พนักงานขับเครน | Operation | Active | Operation Engineer |
| **EMP-021** | นายบุญเลิศ ว่องไว | พนักงานขับเครน | Operation | Active | Operation Engineer |
| **EMP-022** | *(ว่าง / กำลังรับสมัคร)* | พนักงานขับเครน | Operation | **Vacant** | Operation Engineer |
| **EMP-023** | นายบรรเจิด เครื่องจักร | ผู้ควบคุมงานจักรกลหนัก | Heavy Machinery | Active | Operation Engineer |
| **EMP-024** | นายสำราญ แข็งขัน | ผู้ควบคุมงานจักรกลหนัก | Heavy Machinery | Active | Operation Engineer |
| **EMP-025** | นายทินกร เชี่ยวชาญ | ผู้ควบคุมงานจักรกลหนัก | Heavy Machinery | Active | Operation Engineer |
| **EMP-026** | นายสราวุธ ลุยงาน | พนักงานขับจักรกลหนัก | Heavy Machinery | Active | ผู้ควบคุมงานจักรกลหนัก |
| **EMP-027** | นายวิชัย เดินหน้า | พนักงานขับจักรกลหนัก | Heavy Machinery | Active | ผู้ควบคุมงานจักรกลหนัก |
| **EMP-028** | นายคมสัน บุกเบิก | พนักงานขับจักรกลหนัก | Heavy Machinery | Active | ผู้ควบคุมงานจักรกลหนัก |

---

### แบบที่ 2: สรุปกรอบอัตรากำลังตามตำแหน่ง (Role / Manpower Quota)
สำหรับคนที่อยากทำสรุปเฉพาะกรอบตัวเลข

| Wing | Position_Title | Approved_Quota (กรอบ) | Actual (คนจริง) | Vacant (ว่าง) |
| :--- | :--- | :---: | :---: | :---: |
| Management | ผู้จัดการแผนก | 1 | 1 | 0 |
| Management | Operation Engineer | 1 | 1 | 0 |
| O&M | O&M Specialist | 2 | 2 | 0 |
| O&M | O&M Generator | 3 | 3 | 0 |
| O&M | O&M Mechanical | 3 | 2 | 1 |
| O&M | O&M Electrical | 3 | 3 | 0 |
| Operation | ปากเรือ | 3 | 3 | 0 |
| Operation | ผู้ควบคุมงานขนถ่ายสินค้า | 3 | 3 | 0 |
| Operation | พนักงานขับเครน | 3 | 2 | 1 |
| Heavy Machinery | ผู้ควบคุมงานจักรกลหนัก | 3 | 3 | 0 |
| Heavy Machinery | พนักงานขับจักรกลหนัก | 3 | 3 | 0 |
| **รวมทั้งหมด** | | **25** | **23** | **2** |
