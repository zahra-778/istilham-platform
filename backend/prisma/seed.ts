/**
 * Prisma Seed — Istilham Career Platform
 *
 * Populates the database with:
 *   - 8 careers + career weights
 *   - 1 default assessment + 10 questions + options
 *   - 6 simulations + challenges + options
 *   - 1 default admin user (change password in production!)
 */

import { PrismaClient, SimulationDifficulty, SkillIndicator } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ─── Helpers ────────────────────────────────────────────────

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// ─── Main ───────────────────────────────────────────────────

async function main() {
  console.log("🌱 Starting seed…");

  // ── Admin user ─────────────────────────────────────────────
  const adminPassword = await hashPassword("Admin@1234!");
  const admin = await prisma.user.upsert({
    where: { email: "admin@istilham.sa" },
    update: {},
    create: {
      name: "منى العتيبي",
      email: "admin@istilham.sa",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });
  console.log(`✅ Admin user: ${admin.email}`);

  // ── Demo student ──────────────────────────────────────────
  const studentPassword = await hashPassword("Student@1234!");
  const student = await prisma.user.upsert({
    where: { email: "ahmed@student.sa" },
    update: {},
    create: {
      name: "أحمد محمد",
      email: "ahmed@student.sa",
      passwordHash: studentPassword,
      role: "STUDENT",
      studentProfile: {
        create: {
          educationLevel: "الصف الثالث الثانوي",
          city: "الرياض",
          profileCompletion: 87,
        },
      },
      behavioralProfile: {
        create: {
          problemSolving: 87,
          analyticalThinking: 82,
          decisionMaking: 91,
          creativity: 74,
          communication: 79,
          leadership: 71,
          persistence: 88,
          timeManagement: 76,
        },
      },
    },
  });
  console.log(`✅ Demo student: ${student.email}`);

  // ── Careers ────────────────────────────────────────────────

  const careersData = [
    {
      slug: "software-engineering",
      nameAr: "هندسة البرمجيات",
      descriptionAr: "بناء الأنظمة والتطبيقات الرقمية وحل المشكلات التقنية المعقدة.",
      aboutAr:
        "تخصص يهتم بتصميم وبناء وصيانة الأنظمة البرمجية بطريقة منهجية، ويجمع بين التفكير المنطقي وفهم احتياجات المستخدم والقدرة على العمل ضمن فرق تقنية.",
      icon: "Code2",
      requiredSkills: ["التفكير المنطقي والتحليلي", "إتقان أساسيات البرمجة", "فهم هياكل البيانات والخوارزميات", "العمل ضمن فريق تقني", "تصحيح الأخطاء وتتبع المشكلات"],
      traits: ["الصبر والمثابرة", "الدقة في التفاصيل", "حب التعلم المستمر", "القدرة على التركيز الطويل"],
      jobs: ["مهندس برمجيات", "مطور واجهات أمامية", "مطور أنظمة خلفية", "مهندس جودة برمجيات", "مهندس عمليات تشغيل"],
      growthSkills: ["تصميم الأنظمة", "قواعد البيانات", "الاختبار الآلي", "الأمن البرمجي"],
      nextSteps: ["أكمل محاكاة هندسة البرمجيات المتقدمة", "ابدأ مشروعًا تطبيقيًا صغيرًا لتوثيق مهاراتك", "تعلّم أساسيات قواعد البيانات وتصميم الأنظمة"],
      weights: [
        { indicator: SkillIndicator.problemSolving, weight: 0.30 },
        { indicator: SkillIndicator.analyticalThinking, weight: 0.30 },
        { indicator: SkillIndicator.decisionMaking, weight: 0.20 },
        { indicator: SkillIndicator.persistence, weight: 0.20 },
      ],
    },
    {
      slug: "data-analysis",
      nameAr: "تحليل البيانات",
      descriptionAr: "تحويل البيانات الخام إلى رؤى تدعم القرارات داخل المؤسسات.",
      aboutAr:
        "يعتمد هذا التخصص على جمع البيانات وتنظيفها وتحليلها واستخراج أنماط منها، ثم عرضها بصورة واضحة تساعد صناع القرار على اتخاذ خطوات مبنية على أدلة.",
      icon: "BarChart3",
      requiredSkills: ["الإحصاء التطبيقي", "قراءة البيانات وتفسيرها", "أدوات التحليل والجداول", "عرض النتائج بصريًا"],
      traits: ["الفضول التحليلي", "الدقة", "الموضوعية", "القدرة على رواية القصة بالأرقام"],
      jobs: ["محلل بيانات", "محلل أعمال", "مهندس بيانات", "متخصص ذكاء الأعمال"],
      growthSkills: ["نمذجة البيانات", "التنبؤ الإحصائي", "لوحات المعلومات", "تصميم التجارب"],
      nextSteps: ["أكمل محاكاة تحليل البيانات", "درّب نفسك على تحليل مجموعة بيانات واقعية", "تعلّم أساسيات التصور البصري"],
      weights: [
        { indicator: SkillIndicator.analyticalThinking, weight: 0.35 },
        { indicator: SkillIndicator.problemSolving, weight: 0.25 },
        { indicator: SkillIndicator.decisionMaking, weight: 0.20 },
        { indicator: SkillIndicator.timeManagement, weight: 0.20 },
      ],
    },
    {
      slug: "cybersecurity",
      nameAr: "الأمن السيبراني",
      descriptionAr: "حماية الأنظمة والبيانات واكتشاف التهديدات والاستجابة لها.",
      aboutAr:
        "تخصص يركز على تأمين الأنظمة والشبكات، واكتشاف الثغرات قبل استغلالها، والاستجابة السريعة للحوادث الأمنية ضمن إجراءات منضبطة.",
      icon: "ShieldCheck",
      requiredSkills: ["فهم الشبكات", "تحليل السجلات", "إدارة الحوادث", "التفكير كالمهاجم"],
      traits: ["اليقظة", "الانضباط", "هدوء الأعصاب تحت الضغط", "الالتزام الأخلاقي"],
      jobs: ["محلل أمن معلومات", "مختبر اختراق", "مهندس أمن شبكات", "محلل مركز عمليات أمنية"],
      growthSkills: ["تحليل البرمجيات الخبيثة", "الاستجابة للحوادث", "التشفير", "حوكمة الأمن"],
      nextSteps: ["أكمل محاكاة الاستجابة لحادث أمني", "تعلّم أساسيات الشبكات", "تدرّب على تحليل سجلات النظام"],
      weights: [
        { indicator: SkillIndicator.analyticalThinking, weight: 0.30 },
        { indicator: SkillIndicator.decisionMaking, weight: 0.30 },
        { indicator: SkillIndicator.persistence, weight: 0.20 },
        { indicator: SkillIndicator.problemSolving, weight: 0.20 },
      ],
    },
    {
      slug: "business-management",
      nameAr: "إدارة الأعمال",
      descriptionAr: "قيادة الفرق وتنظيم الموارد وتحقيق أهداف المؤسسة.",
      aboutAr:
        "يجمع التخصص بين التخطيط والتنظيم وقيادة الفرق ومتابعة الأداء، ويحتاج إلى مهارات تواصل قوية وقدرة على اتخاذ قرارات متوازنة.",
      icon: "Briefcase",
      requiredSkills: ["التخطيط الاستراتيجي", "إدارة الفرق", "التفاوض", "قراءة المؤشرات المالية"],
      traits: ["المبادرة", "المرونة", "الثقة في التعامل", "تحمل المسؤولية"],
      jobs: ["مدير مشاريع", "مسؤول تطوير أعمال", "مدير عمليات", "مستشار إداري"],
      growthSkills: ["إدارة المشاريع", "تحليل السوق", "القيادة", "إدارة التغيير"],
      nextSteps: ["أكمل محاكاة إدارة فريق تحت ضغط", "تدرّب على إعداد خطة تشغيلية", "طوّر مهارات العرض والإقناع"],
      weights: [
        { indicator: SkillIndicator.leadership, weight: 0.30 },
        { indicator: SkillIndicator.communication, weight: 0.25 },
        { indicator: SkillIndicator.decisionMaking, weight: 0.25 },
        { indicator: SkillIndicator.timeManagement, weight: 0.20 },
      ],
    },
    {
      slug: "marketing",
      nameAr: "التسويق",
      descriptionAr: "فهم السوق وبناء رسائل تصل إلى الجمهور المناسب.",
      aboutAr:
        "يهتم التسويق بدراسة سلوك العملاء وبناء حملات مؤثرة تجمع بين الإبداع والتحليل، مع قياس النتائج وتحسينها باستمرار.",
      icon: "Megaphone",
      requiredSkills: ["كتابة المحتوى", "تحليل الحملات", "فهم الجمهور", "إدارة القنوات الرقمية"],
      traits: ["الإبداع", "الحس الاجتماعي", "سرعة التكيف", "روح المبادرة"],
      jobs: ["أخصائي تسويق رقمي", "مسؤول محتوى", "مدير علامة تجارية", "محلل حملات"],
      growthSkills: ["التسويق بالمحتوى", "تحليل الأداء", "تحسين محركات البحث", "إدارة العلامة"],
      nextSteps: ["أكمل محاكاة إطلاق حملة تسويقية", "حلّل حملة حقيقية وقيّم نتائجها", "طوّر مهارات الكتابة الإعلانية"],
      weights: [
        { indicator: SkillIndicator.creativity, weight: 0.35 },
        { indicator: SkillIndicator.communication, weight: 0.30 },
        { indicator: SkillIndicator.analyticalThinking, weight: 0.20 },
        { indicator: SkillIndicator.timeManagement, weight: 0.15 },
      ],
    },
    {
      slug: "graphic-design",
      nameAr: "التصميم الجرافيكي",
      descriptionAr: "التعبير البصري عن الأفكار وبناء هويات وتجارب جذابة.",
      aboutAr:
        "تخصص بصري يجمع بين الإبداع والانضباط، يعتمد على فهم المستخدم وبناء تصاميم واضحة تخدم رسالة محددة.",
      icon: "Palette",
      requiredSkills: ["مبادئ التصميم", "نظرية الألوان", "الطباعة والخطوط", "أدوات التصميم"],
      traits: ["الحس الجمالي", "التقبل للملاحظات", "الخيال البصري", "الدقة"],
      jobs: ["مصمم جرافيك", "مصمم هوية بصرية", "مصمم تجربة مستخدم", "مصمم حركة"],
      growthSkills: ["تصميم الواجهات", "الرسوم المتحركة", "بناء الهوية", "بحث المستخدم"],
      nextSteps: ["أكمل محاكاة تصميم هوية بصرية", "ابنِ معرض أعمال صغير", "تدرّب على استقبال ملاحظات العميل"],
      weights: [
        { indicator: SkillIndicator.creativity, weight: 0.40 },
        { indicator: SkillIndicator.communication, weight: 0.20 },
        { indicator: SkillIndicator.persistence, weight: 0.20 },
        { indicator: SkillIndicator.timeManagement, weight: 0.20 },
      ],
    },
    {
      slug: "architecture",
      nameAr: "الهندسة المعمارية",
      descriptionAr: "تصميم المباني والفراغات بما يوازن الجمال والوظيفة.",
      aboutAr:
        "يجمع التخصص بين الفن والهندسة، ويتطلب قدرة على التصور المكاني وحل قيود الموقع والميزانية مع الحفاظ على جودة التصميم.",
      icon: "Building2",
      requiredSkills: ["التصور المكاني", "الرسم الهندسي", "فهم المواد", "إدارة القيود التصميمية"],
      traits: ["الصبر", "الدقة", "الإبداع المنضبط", "الاهتمام بالتفاصيل"],
      jobs: ["معماري تصميم", "مهندس إشراف", "مخطط عمراني", "مصمم داخلي"],
      growthSkills: ["النمذجة ثلاثية الأبعاد", "الاستدامة", "إدارة المشاريع", "كود البناء"],
      nextSteps: ["أكمل محاكاة تصميم مبنى بميزانية محدودة", "تدرّب على قراءة المخططات", "تعلّم أساسيات الاستدامة"],
      weights: [
        { indicator: SkillIndicator.creativity, weight: 0.30 },
        { indicator: SkillIndicator.analyticalThinking, weight: 0.25 },
        { indicator: SkillIndicator.persistence, weight: 0.25 },
        { indicator: SkillIndicator.problemSolving, weight: 0.20 },
      ],
    },
    {
      slug: "medicine",
      nameAr: "الطب",
      descriptionAr: "تشخيص الحالات وعلاج المرضى ضمن مسؤولية إنسانية عالية.",
      aboutAr:
        "مسار يتطلب معرفة علمية عميقة وقدرة على اتخاذ قرارات دقيقة تحت الضغط، مع مهارات تواصل إنسانية عالية والتزام طويل بالتعلم.",
      icon: "Stethoscope",
      requiredSkills: ["العلوم الحيوية", "التشخيص السريري", "التواصل مع المرضى", "العمل تحت الضغط"],
      traits: ["التعاطف", "المثابرة الطويلة", "الانضباط", "تحمل المسؤولية"],
      jobs: ["طبيب عام", "طبيب أخصائي", "باحث طبي", "طبيب طوارئ"],
      growthSkills: ["التشخيص التفريقي", "أخلاقيات المهنة", "إدارة الحالات الحرجة", "البحث العلمي"],
      nextSteps: ["أكمل محاكاة قسم الطوارئ", "قيّم قدرتك على التعامل مع الضغط", "تعرّف على متطلبات القبول والدراسة"],
      weights: [
        { indicator: SkillIndicator.decisionMaking, weight: 0.30 },
        { indicator: SkillIndicator.persistence, weight: 0.25 },
        { indicator: SkillIndicator.analyticalThinking, weight: 0.25 },
        { indicator: SkillIndicator.communication, weight: 0.20 },
      ],
    },
  ];

  const careerMap: Record<string, string> = {};

  for (const careerData of careersData) {
    const { weights, ...careerFields } = careerData;
    const career = await prisma.career.upsert({
      where: { slug: careerFields.slug },
      update: careerFields,
      create: careerFields,
    });
    careerMap[career.slug] = career.id;

    // Upsert career weights
    for (const w of weights) {
      await prisma.careerWeight.upsert({
        where: { careerId_indicator: { careerId: career.id, indicator: w.indicator } },
        update: { weight: w.weight },
        create: { careerId: career.id, indicator: w.indicator, weight: w.weight },
      });
    }
  }
  console.log(`✅ Seeded ${careersData.length} careers with weights`);

  // ── Assessment ─────────────────────────────────────────────

  const assessment = await prisma.assessment.upsert({
    where: { id: "default-assessment" },
    update: {},
    create: {
      id: "default-assessment",
      titleAr: "التقييم المبدئي",
      descriptionAr: "اكتشف ميولك المهنية من خلال سلسلة من المواقف الواقعية.",
    },
  });

  const questionsData = [
    {
      id: "q1",
      skill: SkillIndicator.problemSolving,
      sectionAr: "حل المشكلات",
      textAr: "عند مواجهتك لمشكلة معقدة لأول مرة، ما أول خطوة تقوم بها؟",
      orderIndex: 1,
      options: [
        { id: "q1-a", textAr: "أقسّم المشكلة إلى أجزاء أصغر وأبدأ بأبسطها", value: 5, orderIndex: 1 },
        { id: "q1-b", textAr: "أبحث عن حالات مشابهة سبق حلها", value: 4, orderIndex: 2 },
        { id: "q1-c", textAr: "أجرّب حلولًا سريعة حتى ينجح أحدها", value: 2, orderIndex: 3 },
        { id: "q1-d", textAr: "أطلب رأي شخص أكثر خبرة مباشرة", value: 3, orderIndex: 4 },
      ],
    },
    {
      id: "q2",
      skill: SkillIndicator.analyticalThinking,
      sectionAr: "التفكير التحليلي",
      textAr: "أمامك تقرير يحتوي على أرقام متضاربة، كيف تتصرف؟",
      orderIndex: 2,
      options: [
        { id: "q2-a", textAr: "أراجع مصدر كل رقم وأتحقق من طريقة حسابه", value: 5, orderIndex: 1 },
        { id: "q2-b", textAr: "أعتمد على الرقم الأكثر تكرارًا في التقرير", value: 2, orderIndex: 2 },
        { id: "q2-c", textAr: "أقارن التقرير بتقارير سابقة لاكتشاف النمط", value: 4, orderIndex: 3 },
        { id: "q2-d", textAr: "أطلب من الجهة المصدرة توضيحًا وأنتظر", value: 3, orderIndex: 4 },
      ],
    },
    {
      id: "q3",
      skill: SkillIndicator.decisionMaking,
      sectionAr: "اتخاذ القرار",
      textAr: "عليك اتخاذ قرار مهم خلال وقت قصير ومعلوماتك ناقصة، ماذا تفعل؟",
      orderIndex: 3,
      options: [
        { id: "q3-a", textAr: "أحدد أخطر الاحتمالات وأختار الأقل ضررًا", value: 5, orderIndex: 1 },
        { id: "q3-b", textAr: "أؤجل القرار حتى تكتمل المعلومات", value: 2, orderIndex: 2 },
        { id: "q3-c", textAr: "أستشير الفريق سريعًا ثم أقرر", value: 4, orderIndex: 3 },
        { id: "q3-d", textAr: "أختار الخيار المعتاد في مثل هذه المواقف", value: 3, orderIndex: 4 },
      ],
    },
    {
      id: "q4",
      skill: SkillIndicator.creativity,
      sectionAr: "الإبداع",
      textAr: "طُلب منك تقديم فكرة جديدة لمشروع قائم، كيف تبدأ؟",
      orderIndex: 4,
      options: [
        { id: "q4-a", textAr: "أستكشف مجالات مختلفة تمامًا بحثًا عن إلهام", value: 5, orderIndex: 1 },
        { id: "q4-b", textAr: "أطوّر الفكرة الحالية بتحسينات بسيطة", value: 3, orderIndex: 2 },
        { id: "q4-c", textAr: "أجمع أفكار الفريق في جلسة عصف ذهني", value: 4, orderIndex: 3 },
        { id: "q4-d", textAr: "أبحث عن أفكار جاهزة ومجربة", value: 2, orderIndex: 4 },
      ],
    },
    {
      id: "q5",
      skill: SkillIndicator.communication,
      sectionAr: "التواصل",
      textAr: "كيف تشرح فكرة تقنية معقدة لشخص غير متخصص؟",
      orderIndex: 5,
      options: [
        { id: "q5-a", textAr: "أستخدم مثالًا واقعيًا بسيطًا من حياته اليومية", value: 5, orderIndex: 1 },
        { id: "q5-b", textAr: "أشرح التفاصيل كاملة بترتيب منطقي", value: 3, orderIndex: 2 },
        { id: "q5-c", textAr: "أرسم مخططًا بسيطًا يوضح الفكرة", value: 4, orderIndex: 3 },
        { id: "q5-d", textAr: "أختصر وأطلب منه الرجوع للمختصين", value: 2, orderIndex: 4 },
      ],
    },
    {
      id: "q6",
      skill: SkillIndicator.leadership,
      sectionAr: "القيادة",
      textAr: "تعطّل عمل فريقك بسبب خلاف بين عضوين، ما دورك؟",
      orderIndex: 6,
      options: [
        { id: "q6-a", textAr: "أستمع للطرفين وأقترح حلًا يخدم هدف الفريق", value: 5, orderIndex: 1 },
        { id: "q6-b", textAr: "أترك الأمر لهما حتى يتفقا", value: 2, orderIndex: 2 },
        { id: "q6-c", textAr: "أعيد توزيع المهام لتجنّب الاحتكاك", value: 3, orderIndex: 3 },
        { id: "q6-d", textAr: "أرفع الأمر للمسؤول الأعلى", value: 3, orderIndex: 4 },
      ],
    },
    {
      id: "q7",
      skill: SkillIndicator.persistence,
      sectionAr: "المثابرة",
      textAr: "فشلت محاولتك الثالثة في حل مسألة صعبة، ماذا تفعل؟",
      orderIndex: 7,
      options: [
        { id: "q7-a", textAr: "أحلل سبب الفشل وأغيّر الطريقة ثم أعيد المحاولة", value: 5, orderIndex: 1 },
        { id: "q7-b", textAr: "أستريح قليلًا ثم أعود بذهن صافٍ", value: 4, orderIndex: 2 },
        { id: "q7-c", textAr: "أنتقل لمهمة أخرى وأعود لاحقًا إن سنحت الفرصة", value: 3, orderIndex: 3 },
        { id: "q7-d", textAr: "أتركها وأبحث عن حل جاهز", value: 2, orderIndex: 4 },
      ],
    },
    {
      id: "q8",
      skill: SkillIndicator.timeManagement,
      sectionAr: "إدارة الوقت",
      textAr: "لديك ثلاث مهام متزامنة بمواعيد متقاربة، كيف تنظّم وقتك؟",
      orderIndex: 8,
      options: [
        { id: "q8-a", textAr: "أرتّبها حسب الأثر والموعد النهائي وأبدأ بالأهم", value: 5, orderIndex: 1 },
        { id: "q8-b", textAr: "أبدأ بالأسهل لإنجاز عدد أكبر", value: 3, orderIndex: 2 },
        { id: "q8-c", textAr: "أعمل عليها بالتوازي", value: 2, orderIndex: 3 },
        { id: "q8-d", textAr: "أطلب تمديدًا لإحداها وأركّز على الباقي", value: 4, orderIndex: 4 },
      ],
    },
    {
      id: "q9",
      skill: SkillIndicator.problemSolving,
      sectionAr: "أسلوب العمل",
      textAr: "أي بيئة عمل تناسبك أكثر؟",
      orderIndex: 9,
      options: [
        { id: "q9-a", textAr: "بيئة منظمة بمهام واضحة ومعايير دقيقة", value: 4, orderIndex: 1 },
        { id: "q9-b", textAr: "بيئة سريعة التغير تحتاج حلولًا مبتكرة", value: 5, orderIndex: 2 },
        { id: "q9-c", textAr: "بيئة تعاونية قائمة على العمل الجماعي", value: 4, orderIndex: 3 },
        { id: "q9-d", textAr: "بيئة مستقلة أعمل فيها بمفردي", value: 3, orderIndex: 4 },
      ],
    },
    {
      id: "q10",
      skill: SkillIndicator.decisionMaking,
      sectionAr: "أسلوب العمل",
      textAr: "ما الذي يمنحك شعورًا أكبر بالإنجاز في نهاية اليوم؟",
      orderIndex: 10,
      options: [
        { id: "q10-a", textAr: "حل مشكلة كانت تبدو مستعصية", value: 5, orderIndex: 1 },
        { id: "q10-b", textAr: "إنهاء قائمة المهام بالكامل", value: 4, orderIndex: 2 },
        { id: "q10-c", textAr: "مساعدة زميل أو عميل على تجاوز عقبة", value: 4, orderIndex: 3 },
        { id: "q10-d", textAr: "تقديم فكرة جديدة نالت إعجاب الفريق", value: 5, orderIndex: 4 },
      ],
    },
  ];

  for (const qData of questionsData) {
    const { options: optionsList, ...questionFields } = qData;
    await prisma.assessmentQuestion.upsert({
      where: { id: questionFields.id },
      update: {},
      create: {
        ...questionFields,
        assessmentId: assessment.id,
      },
    });
    for (const opt of optionsList) {
      await prisma.assessmentOption.upsert({
        where: { id: opt.id },
        update: {},
        create: { ...opt, questionId: questionFields.id },
      });
    }
  }
  console.log(`✅ Seeded assessment with ${questionsData.length} questions`);

  // ── Simulations ────────────────────────────────────────────

  const simulationsData = [
    {
      slug: "sim-software",
      careerSlug: "software-engineering",
      titleAr: "محاكاة هندسة البرمجيات",
      descriptionAr: "تعامل مع فريق تطوير قبل إطلاق نسخة جديدة، واتخذ قرارات تقنية تحت ضغط الوقت.",
      difficulty: SimulationDifficulty.INTERMEDIATE,
      durationMinutes: 25,
      introAr:
        "أنت تعمل كمهندس برمجيات في فريق منتج، وتبقّت ساعات قليلة على إطلاق النسخة الجديدة. ستواجه سلسلة من المواقف الواقعية وعليك اتخاذ القرار الأنسب في كل موقف.",
      challenges: [
        {
          id: "sim-soft-c1", orderIndex: 1,
          situationAr: "اكتشفت مشكلة في النظام قبل إطلاق النسخة الجديدة بساعتين.",
          questionAr: "ما أول إجراء تتخذه؟",
          hintAr: "فكّر في الخطوة التي تمنحك أكبر قدر من المعلومات بأقل مخاطرة.",
          options: [
            { id: "sim-soft-c1-a", textAr: "تحليل سجلات النظام أولًا لتحديد سبب المشكلة", quality: 5, orderIndex: 1 },
            { id: "sim-soft-c1-b", textAr: "إعادة تشغيل النظام على أمل اختفاء المشكلة", quality: 1, orderIndex: 2 },
            { id: "sim-soft-c1-c", textAr: "نشر حل سريع مباشرة إلى بيئة الإنتاج", quality: 2, orderIndex: 3 },
            { id: "sim-soft-c1-d", textAr: "إبلاغ الفريق وطلب المساعدة قبل أي إجراء", quality: 4, orderIndex: 4 },
          ],
        },
        {
          id: "sim-soft-c2", orderIndex: 2,
          situationAr: "تبيّن أن الخطأ يظهر فقط عند عدد كبير من المستخدمين المتزامنين.",
          questionAr: "كيف تتحقق من الفرضية؟",
          hintAr: "المحاكاة في بيئة اختبار أأمن من التجريب على المستخدمين.",
          options: [
            { id: "sim-soft-c2-a", textAr: "تشغيل اختبار ضغط في بيئة اختبار مطابقة للإنتاج", quality: 5, orderIndex: 1 },
            { id: "sim-soft-c2-b", textAr: "سؤال المستخدمين عن وقت حدوث المشكلة", quality: 3, orderIndex: 2 },
            { id: "sim-soft-c2-c", textAr: "زيادة موارد الخادم مباشرة", quality: 2, orderIndex: 3 },
            { id: "sim-soft-c2-d", textAr: "تجاهل الأمر لأنه نادر الحدوث", quality: 1, orderIndex: 4 },
          ],
        },
        {
          id: "sim-soft-c3", orderIndex: 3,
          situationAr: "مدير المنتج يطلب الإطلاق في الموعد رغم وجود الخطأ.",
          questionAr: "كيف تتعامل مع الطلب؟",
          hintAr: "القرار الجيد يوضح المخاطر ويقدّم بديلًا عمليًا.",
          options: [
            { id: "sim-soft-c3-a", textAr: "أوضّح أثر الخطأ على المستخدمين وأقترح إطلاقًا تدريجيًا", quality: 5, orderIndex: 1 },
            { id: "sim-soft-c3-b", textAr: "أوافق على الإطلاق دون تعليق", quality: 2, orderIndex: 2 },
            { id: "sim-soft-c3-c", textAr: "أرفض الإطلاق تمامًا دون تقديم بديل", quality: 3, orderIndex: 3 },
            { id: "sim-soft-c3-d", textAr: "أؤجل الرد حتى ينتهي الوقت", quality: 1, orderIndex: 4 },
          ],
        },
        {
          id: "sim-soft-c4", orderIndex: 4,
          situationAr: "وجدت حلًا مؤقتًا يعالج المشكلة لكنه يزيد الديون التقنية.",
          questionAr: "ما القرار الأنسب؟",
          hintAr: "الحل المؤقت مقبول إذا كان موثّقًا ومجدولًا للإصلاح.",
          options: [
            { id: "sim-soft-c4-a", textAr: "أطبّق الحل المؤقت مع توثيقه وجدولة إصلاح دائم", quality: 5, orderIndex: 1 },
            { id: "sim-soft-c4-b", textAr: "أطبّق الحل وأنساه بعد الإطلاق", quality: 2, orderIndex: 2 },
            { id: "sim-soft-c4-c", textAr: "أرفض الحل المؤقت وأصرّ على الإصلاح الكامل الآن", quality: 3, orderIndex: 3 },
            { id: "sim-soft-c4-d", textAr: "أترك القرار لزميل آخر", quality: 1, orderIndex: 4 },
          ],
        },
        {
          id: "sim-soft-c5", orderIndex: 5,
          situationAr: "بعد الإطلاق ظهرت شكاوى من بطء في صفحة الطلبات.",
          questionAr: "ما أفضل خطوة تشخيصية؟",
          hintAr: "ابدأ من القياس قبل التعديل.",
          options: [
            { id: "sim-soft-c5-a", textAr: "قياس زمن الاستجابة وتحديد أبطأ عملية", quality: 5, orderIndex: 1 },
            { id: "sim-soft-c5-b", textAr: "إعادة كتابة الصفحة بالكامل", quality: 1, orderIndex: 2 },
            { id: "sim-soft-c5-c", textAr: "إضافة تخزين مؤقت لكل شيء", quality: 3, orderIndex: 3 },
            { id: "sim-soft-c5-d", textAr: "الانتظار لمعرفة إن كانت المشكلة ستختفي", quality: 2, orderIndex: 4 },
          ],
        },
        {
          id: "sim-soft-c6", orderIndex: 6,
          situationAr: "زميل جديد في الفريق يواجه صعوبة في فهم بنية المشروع.",
          questionAr: "كيف تتصرف وأنت تحت ضغط مهامك؟",
          hintAr: "الاستثمار القصير في الفريق يوفّر وقتًا لاحقًا.",
          options: [
            { id: "sim-soft-c6-a", textAr: "أخصّص ٢٠ دقيقة لشرح البنية وأشاركه وثيقة مختصرة", quality: 5, orderIndex: 1 },
            { id: "sim-soft-c6-b", textAr: "أطلب منه الانتظار حتى أنتهي من كل مهامي", quality: 2, orderIndex: 2 },
            { id: "sim-soft-c6-c", textAr: "أحيله لزميل آخر أقل انشغالًا", quality: 3, orderIndex: 3 },
            { id: "sim-soft-c6-d", textAr: "أنجز مهمته بنفسي لتوفير الوقت", quality: 2, orderIndex: 4 },
          ],
        },
        {
          id: "sim-soft-c7", orderIndex: 7,
          situationAr: "تحليل السجلات أظهر أن سبب المشكلة استعلام غير مُفهرس في قاعدة البيانات.",
          questionAr: "ما الإجراء الصحيح؟",
          hintAr: "قِس الأثر قبل وبعد التغيير.",
          options: [
            { id: "sim-soft-c7-a", textAr: "إضافة الفهرس المناسب واختبار الأداء قبل وبعد", quality: 5, orderIndex: 1 },
            { id: "sim-soft-c7-b", textAr: "إضافة فهارس على كل الأعمدة احتياطًا", quality: 2, orderIndex: 2 },
            { id: "sim-soft-c7-c", textAr: "نقل الاستعلام إلى مهمة مجدولة ليلًا", quality: 3, orderIndex: 3 },
            { id: "sim-soft-c7-d", textAr: "تقليل عدد النتائج المعروضة فقط", quality: 3, orderIndex: 4 },
          ],
        },
        {
          id: "sim-soft-c8", orderIndex: 8,
          situationAr: "انتهى الإطلاق بنجاح، وطُلب منك تقرير قصير عن الحادثة.",
          questionAr: "ما الذي تركّز عليه في التقرير؟",
          hintAr: "التقارير الجيدة تعالج السبب الجذري لا الأشخاص.",
          options: [
            { id: "sim-soft-c8-a", textAr: "السبب الجذري والإجراءات الوقائية المستقبلية", quality: 5, orderIndex: 1 },
            { id: "sim-soft-c8-b", textAr: "سرد زمني تفصيلي دون استنتاجات", quality: 3, orderIndex: 2 },
            { id: "sim-soft-c8-c", textAr: "تحديد المسؤول عن الخطأ", quality: 1, orderIndex: 3 },
            { id: "sim-soft-c8-d", textAr: "الاكتفاء بأن المشكلة حُلّت", quality: 2, orderIndex: 4 },
          ],
        },
      ],
    },
    {
      slug: "sim-data",
      careerSlug: "data-analysis",
      titleAr: "محاكاة تحليل البيانات",
      descriptionAr: "حلّل بيانات مبيعات متضاربة وقدّم توصية مبنية على أدلة لفريق الإدارة.",
      difficulty: SimulationDifficulty.INTERMEDIATE,
      durationMinutes: 20,
      introAr:
        "أنت محلل بيانات في شركة تجزئة، لاحظت الإدارة انخفاضًا مفاجئًا في المبيعات وطلبت منك تفسيرًا خلال يومين.",
      challenges: [
        {
          id: "sim-data-c1", orderIndex: 1,
          situationAr: "البيانات الواردة من الفروع تحتوي على قيم مفقودة ومكررة.",
          questionAr: "ما أول خطوة؟",
          hintAr: "جودة البيانات تسبق التحليل.",
          options: [
            { id: "sim-data-c1-a", textAr: "تنظيف البيانات وتوثيق كل تعديل", quality: 5, orderIndex: 1 },
            { id: "sim-data-c1-b", textAr: "حذف كل صف ناقص مباشرة", quality: 2, orderIndex: 2 },
            { id: "sim-data-c1-c", textAr: "البدء بالتحليل وتجاهل النواقص", quality: 1, orderIndex: 3 },
            { id: "sim-data-c1-d", textAr: "طلب إعادة تصدير البيانات من الفروع", quality: 4, orderIndex: 4 },
          ],
        },
        {
          id: "sim-data-c2", orderIndex: 2,
          situationAr: "الانخفاض يظهر في فرعين فقط من عشرة فروع.",
          questionAr: "كيف تكمل التحليل؟",
          hintAr: "المقارنة تكشف العامل المشترك.",
          options: [
            { id: "sim-data-c2-a", textAr: "مقارنة خصائص الفرعين بباقي الفروع لتحديد العامل المشترك", quality: 5, orderIndex: 1 },
            { id: "sim-data-c2-b", textAr: "تعميم النتيجة على كل الفروع", quality: 1, orderIndex: 2 },
            { id: "sim-data-c2-c", textAr: "دراسة سلوك العملاء في الفرعين فقط", quality: 4, orderIndex: 3 },
            { id: "sim-data-c2-d", textAr: "الاكتفاء بعرض الأرقام دون تفسير", quality: 2, orderIndex: 4 },
          ],
        },
        {
          id: "sim-data-c3", orderIndex: 3,
          situationAr: "وجدت ارتباطًا بين الانخفاض وأعمال صيانة الطرق قرب الفرعين.",
          questionAr: "كيف تعرض النتيجة؟",
          hintAr: "الارتباط لا يعني السببية.",
          options: [
            { id: "sim-data-c3-a", textAr: "أعرضها كفرضية مدعومة بالأدلة مع اقتراح تحقق إضافي", quality: 5, orderIndex: 1 },
            { id: "sim-data-c3-b", textAr: "أعلن أنها السبب المؤكد", quality: 2, orderIndex: 2 },
            { id: "sim-data-c3-c", textAr: "أهمل النتيجة لأنها خارجة عن سيطرة الشركة", quality: 2, orderIndex: 3 },
            { id: "sim-data-c3-d", textAr: "أطلب بيانات حركة المرور لتأكيد العلاقة", quality: 5, orderIndex: 4 },
          ],
        },
        {
          id: "sim-data-c4", orderIndex: 4,
          situationAr: "الإدارة تريد رقمًا واحدًا يلخّص الأثر.",
          questionAr: "ماذا تقدّم؟",
          hintAr: "الرقم المفيد يوضّح المدى والافتراضات.",
          options: [
            { id: "sim-data-c4-a", textAr: "نسبة الانخفاض المقدّرة مع هامش خطأ وافتراضات واضحة", quality: 5, orderIndex: 1 },
            { id: "sim-data-c4-b", textAr: "متوسط بسيط دون سياق", quality: 2, orderIndex: 2 },
            { id: "sim-data-c4-c", textAr: "أرفض تقديم رقم واحد", quality: 3, orderIndex: 3 },
            { id: "sim-data-c4-d", textAr: "رقم متفائل لتهدئة الإدارة", quality: 1, orderIndex: 4 },
          ],
        },
        {
          id: "sim-data-c5", orderIndex: 5,
          situationAr: "بقي يوم واحد على موعد العرض ولم تكتمل لوحة المعلومات.",
          questionAr: "كيف تدير وقتك؟",
          hintAr: "الرسالة أهم من الزخرفة.",
          options: [
            { id: "sim-data-c5-a", textAr: "أركّز على ثلاثة رسوم أساسية تخدم التوصية", quality: 5, orderIndex: 1 },
            { id: "sim-data-c5-b", textAr: "أضيف كل الرسوم الممكنة", quality: 2, orderIndex: 2 },
            { id: "sim-data-c5-c", textAr: "أؤجل العرض", quality: 2, orderIndex: 3 },
            { id: "sim-data-c5-d", textAr: "أقدّم جدولًا خامًا دون تصور بصري", quality: 3, orderIndex: 4 },
          ],
        },
        {
          id: "sim-data-c6", orderIndex: 6,
          situationAr: "أحد المديرين يشكك في نتائجك أمام الفريق.",
          questionAr: "كيف ترد؟",
          hintAr: "الشفافية في المنهجية تبني الثقة.",
          options: [
            { id: "sim-data-c6-a", textAr: "أشرح المنهجية ومصادر البيانات وأعرض التحقق من أي بديل", quality: 5, orderIndex: 1 },
            { id: "sim-data-c6-b", textAr: "أدافع عن النتيجة دون تفاصيل", quality: 2, orderIndex: 2 },
            { id: "sim-data-c6-c", textAr: "أتراجع عن التوصية فورًا", quality: 1, orderIndex: 3 },
            { id: "sim-data-c6-d", textAr: "أطلب مناقشة لاحقة بعد مراجعة البيانات معه", quality: 4, orderIndex: 4 },
          ],
        },
      ],
    },
    {
      slug: "sim-security",
      careerSlug: "cybersecurity",
      titleAr: "محاكاة الأمن السيبراني",
      descriptionAr: "استجب لحادث أمني مشتبه به وحدد أولويات الاحتواء والتحقيق.",
      difficulty: SimulationDifficulty.ADVANCED,
      durationMinutes: 30,
      introAr: "أنت محلل في مركز عمليات أمنية، وصلك تنبيه بمحاولات دخول غير معتادة على حساب إداري.",
      challenges: [
        {
          id: "sim-sec-c1", orderIndex: 1,
          situationAr: "تنبيه بمحاولات دخول متكررة من دولة غير معتادة.",
          questionAr: "ما أول إجراء؟",
          hintAr: "الاحتواء أولًا، ثم التحقيق.",
          options: [
            { id: "sim-sec-c1-a", textAr: "تعليق الحساب مؤقتًا وبدء مراجعة السجلات", quality: 5, orderIndex: 1 },
            { id: "sim-sec-c1-b", textAr: "الانتظار لمعرفة إن كان الدخول سينجح", quality: 1, orderIndex: 2 },
            { id: "sim-sec-c1-c", textAr: "إرسال بريد للمستخدم فقط", quality: 3, orderIndex: 3 },
            { id: "sim-sec-c1-d", textAr: "حظر الدولة بالكامل على مستوى الشبكة", quality: 3, orderIndex: 4 },
          ],
        },
        {
          id: "sim-sec-c2", orderIndex: 2,
          situationAr: "السجلات تظهر جلسة ناجحة واحدة قبل ساعة.",
          questionAr: "ما الخطوة التالية؟",
          hintAr: "افترض أن الجلسة خبيثة حتى يثبت العكس.",
          options: [
            { id: "sim-sec-c2-a", textAr: "إنهاء الجلسات النشطة وتتبع كل ما نفّذته الجلسة", quality: 5, orderIndex: 1 },
            { id: "sim-sec-c2-b", textAr: "تغيير كلمة المرور فقط", quality: 3, orderIndex: 2 },
            { id: "sim-sec-c2-c", textAr: "أرشفة التنبيه كإنذار كاذب", quality: 1, orderIndex: 3 },
            { id: "sim-sec-c2-d", textAr: "إبلاغ الإدارة دون إجراء تقني", quality: 2, orderIndex: 4 },
          ],
        },
        {
          id: "sim-sec-c3", orderIndex: 3,
          situationAr: "اكتشفت أن الجلسة نزّلت ملفًا يحتوي بيانات عملاء.",
          questionAr: "ما التصرف الصحيح؟",
          hintAr: "الحوادث ذات الأثر على البيانات لها مسار تصعيد محدد.",
          options: [
            { id: "sim-sec-c3-a", textAr: "تصعيد الحادث فورًا وفق إجراءات الاستجابة وتوثيق الأدلة", quality: 5, orderIndex: 1 },
            { id: "sim-sec-c3-b", textAr: "حذف الملف من الخادم وإغلاق الحادث", quality: 1, orderIndex: 2 },
            { id: "sim-sec-c3-c", textAr: "الاستمرار في التحقيق دون تصعيد", quality: 2, orderIndex: 3 },
            { id: "sim-sec-c3-d", textAr: "إبلاغ الفريق التقني فقط", quality: 3, orderIndex: 4 },
          ],
        },
        {
          id: "sim-sec-c4", orderIndex: 4,
          situationAr: "الإدارة تطلب تقييمًا سريعًا لحجم الضرر.",
          questionAr: "ماذا تقدّم؟",
          hintAr: "ميّز بين المؤكد والمحتمل.",
          options: [
            { id: "sim-sec-c4-a", textAr: "تقييم أولي يفصل بين ما تأكد وما هو قيد التحقق", quality: 5, orderIndex: 1 },
            { id: "sim-sec-c4-b", textAr: "تطمين بأن الضرر محدود دون دليل", quality: 1, orderIndex: 2 },
            { id: "sim-sec-c4-c", textAr: "الامتناع عن أي تقدير", quality: 3, orderIndex: 3 },
            { id: "sim-sec-c4-d", textAr: "تقدير الحد الأقصى للضرر فقط", quality: 3, orderIndex: 4 },
          ],
        },
        {
          id: "sim-sec-c5", orderIndex: 5,
          situationAr: "انتهى الاحتواء وطُلب منك خطة وقائية.",
          questionAr: "ما أولويتك الأولى؟",
          hintAr: "ابدأ بالضوابط التي تمنع تكرار نفس الطريقة.",
          options: [
            { id: "sim-sec-c5-a", textAr: "تفعيل التحقق بخطوتين ومراجعة صلاحيات الحسابات الإدارية", quality: 5, orderIndex: 1 },
            { id: "sim-sec-c5-b", textAr: "شراء أداة أمنية جديدة", quality: 2, orderIndex: 2 },
            { id: "sim-sec-c5-c", textAr: "إرسال تعميم توعوي فقط", quality: 3, orderIndex: 3 },
            { id: "sim-sec-c5-d", textAr: "زيادة عدد التنبيهات دون ضبطها", quality: 2, orderIndex: 4 },
          ],
        },
      ],
    },
    {
      slug: "sim-marketing",
      careerSlug: "marketing",
      titleAr: "محاكاة التسويق",
      descriptionAr: "أطلق حملة لمنتج جديد بميزانية محدودة وقس نتائجها وحسّنها.",
      difficulty: SimulationDifficulty.BEGINNER,
      durationMinutes: 15,
      introAr: "أنت مسؤول تسويق في شركة ناشئة، ولديك ميزانية محدودة لإطلاق منتج جديد خلال أسبوعين.",
      challenges: [
        {
          id: "sim-mkt-c1", orderIndex: 1,
          situationAr: "لديك ميزانية محدودة وثلاث قنوات محتملة.",
          questionAr: "كيف توزّع الميزانية؟",
          hintAr: "الاختبار الصغير قبل التوسع يقلّل الخسارة.",
          options: [
            { id: "sim-mkt-c1-a", textAr: "اختبار صغير على القنوات الثلاث ثم التركيز على الأفضل", quality: 5, orderIndex: 1 },
            { id: "sim-mkt-c1-b", textAr: "صرف الميزانية كاملة على القناة الأشهر", quality: 2, orderIndex: 2 },
            { id: "sim-mkt-c1-c", textAr: "توزيع متساوٍ ثابت طوال الحملة", quality: 3, orderIndex: 3 },
            { id: "sim-mkt-c1-d", textAr: "تأجيل الحملة لزيادة الميزانية", quality: 2, orderIndex: 4 },
          ],
        },
        {
          id: "sim-mkt-c2", orderIndex: 2,
          situationAr: "نسبة النقر مرتفعة لكن التحويل منخفض جدًا.",
          questionAr: "أين تبحث عن المشكلة؟",
          hintAr: "الفجوة بين الإعلان والصفحة سبب شائع.",
          options: [
            { id: "sim-mkt-c2-a", textAr: "أراجع صفحة الهبوط ووضوح العرض وسهولة الشراء", quality: 5, orderIndex: 1 },
            { id: "sim-mkt-c2-b", textAr: "أزيد ميزانية الإعلان", quality: 1, orderIndex: 2 },
            { id: "sim-mkt-c2-c", textAr: "أغيّر صورة الإعلان فقط", quality: 3, orderIndex: 3 },
            { id: "sim-mkt-c2-d", textAr: "أوقف الحملة فورًا", quality: 2, orderIndex: 4 },
          ],
        },
        {
          id: "sim-mkt-c3", orderIndex: 3,
          situationAr: "أحد الإعلانات أثار تعليقات سلبية.",
          questionAr: "كيف تتعامل؟",
          hintAr: "الرد المهني السريع يحمي السمعة.",
          options: [
            { id: "sim-mkt-c3-a", textAr: "أرد بشفافية وأصحّح المعلومة وأراجع الرسالة", quality: 5, orderIndex: 1 },
            { id: "sim-mkt-c3-b", textAr: "أحذف التعليقات", quality: 1, orderIndex: 2 },
            { id: "sim-mkt-c3-c", textAr: "أتجاهل الأمر تمامًا", quality: 2, orderIndex: 3 },
            { id: "sim-mkt-c3-d", textAr: "أوقف الإعلان وأدرس الأسباب", quality: 4, orderIndex: 4 },
          ],
        },
        {
          id: "sim-mkt-c4", orderIndex: 4,
          situationAr: "انتهت الحملة وحققت نتائج متوسطة.",
          questionAr: "ما محتوى تقريرك؟",
          hintAr: "الدروس المستفادة أهم من الأرقام وحدها.",
          options: [
            { id: "sim-mkt-c4-a", textAr: "النتائج مقارنة بالأهداف مع دروس مستفادة وخطة تحسين", quality: 5, orderIndex: 1 },
            { id: "sim-mkt-c4-b", textAr: "الأرقام الإيجابية فقط", quality: 1, orderIndex: 2 },
            { id: "sim-mkt-c4-c", textAr: "ملخص عام دون توصيات", quality: 3, orderIndex: 3 },
            { id: "sim-mkt-c4-d", textAr: "مقارنة بالمنافسين فقط", quality: 3, orderIndex: 4 },
          ],
        },
      ],
    },
    {
      slug: "sim-business",
      careerSlug: "business-management",
      titleAr: "محاكاة إدارة الأعمال",
      descriptionAr: "قُد فريقًا خلال أزمة تشغيلية ووازن بين الموارد والمواعيد ورضا العملاء.",
      difficulty: SimulationDifficulty.INTERMEDIATE,
      durationMinutes: 22,
      introAr: "أنت مدير مشروع، وتأخر أحد الموردين مما يهدد تسليم مشروع لعميل رئيسي.",
      challenges: [
        {
          id: "sim-biz-c1", orderIndex: 1,
          situationAr: "تأخر المورد أسبوعًا كاملًا عن الموعد.",
          questionAr: "ما أول إجراء؟",
          hintAr: "قيّم الأثر قبل الوعد بأي شيء.",
          options: [
            { id: "sim-biz-c1-a", textAr: "تقييم أثر التأخير على الجدول ثم إبلاغ العميل بخطة بديلة", quality: 5, orderIndex: 1 },
            { id: "sim-biz-c1-b", textAr: "إخفاء التأخير حتى آخر لحظة", quality: 1, orderIndex: 2 },
            { id: "sim-biz-c1-c", textAr: "تغيير المورد فورًا", quality: 3, orderIndex: 3 },
            { id: "sim-biz-c1-d", textAr: "الضغط على الفريق للتعويض دون خطة", quality: 2, orderIndex: 4 },
          ],
        },
        {
          id: "sim-biz-c2", orderIndex: 2,
          situationAr: "عضو في الفريق يعاني من ضغط عمل زائد.",
          questionAr: "كيف تتصرف؟",
          hintAr: "إنتاجية الفريق مرتبطة بتوازن الأحمال.",
          options: [
            { id: "sim-biz-c2-a", textAr: "أعيد توزيع المهام وأتفق معه على أولويات واضحة", quality: 5, orderIndex: 1 },
            { id: "sim-biz-c2-b", textAr: "أطلب منه بذل مجهود إضافي مؤقت", quality: 2, orderIndex: 2 },
            { id: "sim-biz-c2-c", textAr: "أنتظر حتى ينتهي الضغط", quality: 1, orderIndex: 3 },
            { id: "sim-biz-c2-d", textAr: "أستعين بدعم مؤقت من فريق آخر", quality: 4, orderIndex: 4 },
          ],
        },
        {
          id: "sim-biz-c3", orderIndex: 3,
          situationAr: "العميل يطلب إضافة متطلب جديد دون تغيير الموعد.",
          questionAr: "ما ردك؟",
          hintAr: "وضّح المقايضة بين النطاق والوقت والموارد.",
          options: [
            { id: "sim-biz-c3-a", textAr: "أوضّح الأثر وأعرض خيارات: تأجيل، أو تقليل نطاق آخر", quality: 5, orderIndex: 1 },
            { id: "sim-biz-c3-b", textAr: "أوافق مباشرة", quality: 2, orderIndex: 2 },
            { id: "sim-biz-c3-c", textAr: "أرفض دون نقاش", quality: 2, orderIndex: 3 },
            { id: "sim-biz-c3-d", textAr: "أحيله للإدارة العليا", quality: 3, orderIndex: 4 },
          ],
        },
        {
          id: "sim-biz-c4", orderIndex: 4,
          situationAr: "المشروع سُلّم بنجاح متأخرًا ثلاثة أيام.",
          questionAr: "ما الخطوة الختامية الأهم؟",
          hintAr: "التعلم المؤسسي يمنع تكرار الأزمة.",
          options: [
            { id: "sim-biz-c4-a", textAr: "جلسة مراجعة لتوثيق الدروس وتحديث خطة المخاطر", quality: 5, orderIndex: 1 },
            { id: "sim-biz-c4-b", textAr: "الانتقال للمشروع التالي مباشرة", quality: 2, orderIndex: 2 },
            { id: "sim-biz-c4-c", textAr: "توجيه اللوم للمورد فقط", quality: 1, orderIndex: 3 },
            { id: "sim-biz-c4-d", textAr: "الاكتفاء بشكر الفريق", quality: 3, orderIndex: 4 },
          ],
        },
      ],
    },
    {
      slug: "sim-design",
      careerSlug: "graphic-design",
      titleAr: "محاكاة التصميم الجرافيكي",
      descriptionAr: "صمّم هوية بصرية لعميل وتعامل مع ملاحظات متغيرة ومواعيد ضيقة.",
      difficulty: SimulationDifficulty.BEGINNER,
      durationMinutes: 18,
      introAr: "طلب منك عميل تصميم هوية بصرية لمشروع تعليمي خلال أسبوع واحد.",
      challenges: [
        {
          id: "sim-des-c1", orderIndex: 1,
          situationAr: "العميل قدّم وصفًا غامضًا لما يريد.",
          questionAr: "ما أول خطوة؟",
          hintAr: "الوضوح المبكر يقلل التعديلات لاحقًا.",
          options: [
            { id: "sim-des-c1-a", textAr: "أجري جلسة أسئلة وأبني لوحة إلهام للاتفاق على الاتجاه", quality: 5, orderIndex: 1 },
            { id: "sim-des-c1-b", textAr: "أبدأ التصميم حسب ذوقي", quality: 2, orderIndex: 2 },
            { id: "sim-des-c1-c", textAr: "أطلب أمثلة من منافسيه فقط", quality: 3, orderIndex: 3 },
            { id: "sim-des-c1-d", textAr: "أنتظر حتى يوضّح بنفسه", quality: 1, orderIndex: 4 },
          ],
        },
        {
          id: "sim-des-c2", orderIndex: 2,
          situationAr: "العميل رفض المقترح الأول بالكامل.",
          questionAr: "كيف تتصرف؟",
          hintAr: "افهم سبب الرفض قبل إعادة التصميم.",
          options: [
            { id: "sim-des-c2-a", textAr: "أسأل عن العناصر المرفوضة تحديدًا وأعيد التصميم بناءً عليها", quality: 5, orderIndex: 1 },
            { id: "sim-des-c2-b", textAr: "أقدّم خمسة مقترحات جديدة عشوائيًا", quality: 2, orderIndex: 2 },
            { id: "sim-des-c2-c", textAr: "أدافع عن تصميمي وأصرّ عليه", quality: 2, orderIndex: 3 },
            { id: "sim-des-c2-d", textAr: "أعدّل الألوان فقط", quality: 3, orderIndex: 4 },
          ],
        },
        {
          id: "sim-des-c3", orderIndex: 3,
          situationAr: "الوقت المتبقي يومان فقط وهناك ثلاث نواتج مطلوبة.",
          questionAr: "كيف تنظّم عملك؟",
          hintAr: "ابدأ بما يعتمد عليه الباقي.",
          options: [
            { id: "sim-des-c3-a", textAr: "أنجز الشعار أولًا لأن باقي العناصر تُبنى عليه", quality: 5, orderIndex: 1 },
            { id: "sim-des-c3-b", textAr: "أعمل على الثلاثة بالتوازي", quality: 2, orderIndex: 2 },
            { id: "sim-des-c3-c", textAr: "أبدأ بالأسهل", quality: 3, orderIndex: 3 },
            { id: "sim-des-c3-d", textAr: "أطلب تمديدًا فورًا", quality: 3, orderIndex: 4 },
          ],
        },
      ],
    },
  ];

  for (const simData of simulationsData) {
    const { challenges, careerSlug, ...simFields } = simData;
    const careerId = careerMap[careerSlug];
    if (!careerId) {
      console.warn(`⚠️  Career not found for slug: ${careerSlug}`);
      continue;
    }

    const simulation = await prisma.simulation.upsert({
      where: { slug: simFields.slug },
      update: {},
      create: { ...simFields, careerId },
    });

    for (const challenge of challenges) {
      const { options: optionsList, ...challengeFields } = challenge;
      await prisma.simulationChallenge.upsert({
        where: { id: challengeFields.id },
        update: {},
        create: { ...challengeFields, simulationId: simulation.id },
      });

      for (const opt of optionsList) {
        await prisma.challengeOption.upsert({
          where: { id: opt.id },
          update: {},
          create: { ...opt, challengeId: challengeFields.id },
        });
      }
    }
  }
  console.log(`✅ Seeded ${simulationsData.length} simulations with challenges`);

  console.log("✅ Seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
