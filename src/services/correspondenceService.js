// LocalStorage Keys
const STORAGE_KEY_PENDING = 'moraslat_pending_queue';
const STORAGE_KEY_ARCHIVE = 'moraslat_archive_queue';

// Available Departments
export const DEPARTMENTS = [
  { id: 'dept-1', name: 'مكتب المدير العام', code: 'DIR' },
  { id: 'dept-2', name: 'الشؤون الثقافية والأنشطة', code: 'CUL' },
  { id: 'dept-3', name: 'الشؤون المالية والحسابات', code: 'FIN' },
  { id: 'dept-4', name: 'الموارد البشرية والتدريب', code: 'HR' },
  { id: 'dept-5', name: 'الإدارة القانونية والحوكمة', code: 'LEG' },
  { id: 'dept-6', name: 'العلاقات العامة والإعلام', code: 'PR' },
  { id: 'dept-7', name: 'التخطيط والمتابعة والتطوير', code: 'PLN' },
  { id: 'dept-8', name: 'المراجعة والتدقيق الداخلي', code: 'AUD' },
];

// Preset Quick Note Suggestions
export const PRESET_NOTES = [
  'للاطلاع والافادة، واتخاذ اللازم حسب الأنظمة والتطبيقات المعمول بها.',
  'للدراسة وإبداء الرأي الفني والقانوني قبل اتخاذ القرار النهائي.',
  'للاعتماد الفوري وإكمال الإجراءات المالية والإدارية حسب الأصول.',
  'للحفظ بالأرشيف الإلكتروني بعد الإحاطة والمتابعة.',
  'عاجل جداً: يرجى موافاتنا بالتقرير والإفادة خلال 24 ساعة.'
];

// Initial Mock Dataset
const INITIAL_PENDING_QUEUE = [
  {
    id: 'IEC-2026-001',
    refNumber: 'IEC-2026-001',
    subject: 'طلب اعتماد الميزانية التشغيلية للمؤتمر الثقافي السنوي لعام 2026م',
    sender: 'إدارة الشؤون الثقافية والأنشطة',
    senderRepresentative: 'د. عبد الرحمن السعيد - مدير الإدارة',
    dateGregorian: '12 أغسطس 2026',
    dateHijri: '29 صفر 1448 هـ',
    type: 'internal', // internal | external
    priority: 'urgent', // urgent | important | normal
    status: 'pending', // pending | annotated | archived
    targetDepartment: 'الشؤون المالية والحسابات',
    summary: 'نرفق لكم جدول التكاليف التقديرية للمؤتمر الثقافي المزمع إقامته في بداية الشهر القادم، نرجو التكرم بالاطلاع والاعتماد ليتسنى لنا البدء في التجهيزات اللوجستية وتأمين الموازنة المطلوب تخصيصها.',
    pageCount: 2,
    annotations: {}, // { 1: [...], 2: [...] }
    routeHistory: [],
    completedAt: null,
    documentContent: {
      headerTitle: 'جمهورية مصر العربية - وزارة الثقافة',
      docTypeLabel: 'مراسلة داخلية - عاجلة جداً',
      refNo: 'IEC-2026-001/ثق',
      pages: [
        {
          pageNumber: 1,
          contentTitle: 'مذكرة عرض على سعادة المدير العام',
          bodyParagraphs: [
            'السلام عليكم ورحمة الله وبركاته،، وبعد:',
            'إشارة إلى القرار الإداري الصادر بشأن الإعداد والتحضير للمؤتمر الثقافي السنوي لعام 2026م تحت شعار "الابتكار والأصالة في العصر الرقمي"، يطيب لنا أن نرفع لسعادتكم البيان التفصيلي للميزانية التقديرية المطلوبة لتغطية فعاليات المؤتمر.',
            'نود الإحاطة بأن اللجان التحضيرية أكملت حصر وتحديد متطلبات استضافة الوفود المشاركة، طباعة الكتيبات والمطبوعات الرسمية، وتجهيز قاعات المحاضرات بالأنظمة الصوتية والمرئية الذكية وفق أحدث المعايير.',
            'ويتضمن الجدول المرفق بالصفحة التالية توزيع بنود النفقات التشغيلية والمكافآت التقديرية للمحاضرين والمحكمين الدوليين.',
            'نأمل من سعادتكم التكرم بالاطلاع والتوجيه بما ترونه مناسباً للإحالة إلى الشؤون المالية والحسابات لربط المبلغ والبدء في الصرف.'
          ],
          signatureBlock: {
            title: 'مدير إدارة الشؤون الثقافية',
            name: 'د. عبد الرحمن السعيد',
            date: '1448/02/29 هـ'
          }
        },
        {
          pageNumber: 2,
          contentTitle: 'جدول بيان التكاليف التقديرية للمؤتمر',
          tableData: {
            headers: ['م', 'بند النفقة', 'التكلفة التقديرية (جنيه)', 'ملاحظات وتفاصيل'],
            rows: [
              ['1', 'حجز القاعات والتجهيزات الفنية', '45,000', 'شاملة الصوتيات والعروض المباشرة'],
              ['2', 'مطبوعات وهدايا تذكارية للضيوف', '22,500', 'حقائب المؤتمر والكتيب التعريفي'],
              ['3', 'ضيافة واستقبال الوفود الخارجية', '35,000', 'إقامة وإعاشة لمدة 3 أيام'],
              ['4', 'مكافآت المحاضرين ورؤساء الجلسات', '60,000', 'بواقع 8 جلسات حوارية ورئيسية'],
              ['5', 'طوارئ ونفقات نثرية غير منظورة', '12,500', 'تغطية أي بنود مستجدة أثناء الفعالية']
            ],
            total: '175,000 جنيه مصري'
          },
          bodyParagraphs: [
            'ملاحظة: تم مراعاة خفض التكاليف بنسبة 15% مقارنة بميزانية العام الماضي بالتنسيق مع قسم المشتريات.'
          ],
          signatureBlock: {
            title: 'رئيس لجنة الميزانية',
            name: 'أ. طارق بن عبد العزيز',
            date: '1448/02/29 هـ'
          }
        }
      ]
    }
  },
  {
    id: 'IEC-2026-002',
    refNumber: 'IEC-2026-002',
    subject: 'دعوة مشاركة في الندوة الوطنية للتحول الرقمي والأرشفة الإلكترونية',
    sender: 'وزارة الاتصالات وتقنية المعلومات - الأمانة العامة',
    senderRepresentative: 'م. خالد بن منصور العتيبي - أمين عام الهيئة',
    dateGregorian: '11 أغسطس 2026',
    dateHijri: '28 صفر 1448 هـ',
    type: 'external',
    priority: 'important',
    status: 'pending',
    targetDepartment: 'التخطيط والمتابعة والتطوير',
    summary: 'يسرنا دعوتكم لحضور وتقديم ورشة عمل حول التجارب الناجحة في التهميش والأرشفة الإلكترونية الذكية خلال الندوة المنعقدة بتاريخ 25 أغسطس في مركز المؤتمرات.',
    pageCount: 1,
    annotations: {},
    routeHistory: [],
    completedAt: null,
    documentContent: {
      headerTitle: 'جمهورية مصر العربية - وزارة الاتصالات وتقنية المعلومات',
      docTypeLabel: 'خطاب خارجي وارد',
      refNo: 'EXT-9942/2026',
      pages: [
        {
          pageNumber: 1,
          contentTitle: 'دعوة حضور وتقديم ورشة عمل فنية',
          bodyParagraphs: [
            'سعادة مدير عام المؤسسة المحترم،،',
            'تحية طيبة وبعد:',
            'في إطار تعزيز التعاون بين الجهات الحكومية وتبادل الخبرات في تطبيق أنظمة التحول الرقمي وإدارة المعاملات والمراسلات الإلكترونية، تسرنا دعوتكم للمشاركة في أعمال "الندوة الوطنية للتحول الرقمي والأرشفة الذكية" التي ستعقد بمشيئة الله يوم الثلاثاء 25 أغسطس 2026م.',
            'وننتهز هذه الفرصة لطلب ترشيح ممثلين عن إدارتكم الموقرة لتقديم عرض مرئي لمدة 30 دقيقة يرصد تجربتكم الرائدة في تفعيل نظام "تهميش وتوجيه المراسلات" وتسريع إجراءات الإحالة الإدارية.',
            'شاكرين ومقدرين حسن تعاونكم الدائم لما فيه خدمة المصلحة العامة.'
          ],
          signatureBlock: {
            title: 'أمين عام هيئة تقنية المعلومات',
            name: 'م. خالد بن منصور العتيبي',
            date: '2026/08/11م'
          }
        }
      ]
    }
  },
  {
    id: 'IEC-2026-003',
    refNumber: 'IEC-2026-003',
    subject: 'تقرير المراجعة النصف سنوية للالتزام الإداري والحوكمة المؤسسية',
    sender: 'إدارة المراجعة والتدقيق الداخلي',
    senderRepresentative: 'أ. فاطمة الزهراء الشمري - رئيس المراجعة الداخلية',
    dateGregorian: '10 أغسطس 2026',
    dateHijri: '27 صفر 1448 هـ',
    type: 'internal',
    priority: 'normal',
    status: 'pending',
    targetDepartment: 'مكتب المدير العام',
    summary: 'نرفع لسيادتكم التقرير التفصيلي المتضمن ناتج فحص وتدقيق المعاملات الإدارية والمالية للفترة من يناير إلى يونيو 2026م مع توصيات التحسين الواجب اتباعها.',
    pageCount: 2,
    annotations: {},
    routeHistory: [],
    completedAt: null,
    documentContent: {
      headerTitle: 'جمهورية مصر العربية - إدارة المراجعة والتدقيق الداخلي',
      docTypeLabel: 'تقرير مراجعة داخلي',
      refNo: 'AUD-2026-042',
      pages: [
        {
          pageNumber: 1,
          contentTitle: 'ملخص النتائج الإحصائية للنصف الأول لعام 2026م',
          bodyParagraphs: [
            'سعادة المدير العام المحترم،،',
            'السلام عليكم ورحمة الله وبركاته،،',
            'قامت إدارة المراجعة والتدقيق الداخلي بفحص عينة مُمثلة من المراسلات والتوجيهات الإدارية الصادرة والواردة خلال النصف الأول من العام الحالي 2026م.',
            'وقد أظهرت نتائج الفحص ما يلي:',
            '1. ارتفاع نسبة الالتزام بزمن إنجاز المراسلات الإدارية من 68% إلى 91% بعد أتمتة التوجيه.',
            '2. انخفاض ملحوظ في نسبة المعاملات المتبقية في الطابور لأكثر من 48 ساعة.',
            '3. اكتمال الأرشفة الإلكترونية لجميع المراسلات الصادرة والواردة بنسبة 99.4%.'
          ],
          signatureBlock: {
            title: 'رئيس قسم التدقيق',
            name: 'أ. فاطمة الزهراء الشمري',
            date: '1448/02/27 هـ'
          }
        },
        {
          pageNumber: 2,
          contentTitle: 'التوصيات والإجراءات التصحيحية الموصى بها',
          bodyParagraphs: [
            'بناءً على النتائج الواردة أعلاه، توصي إدارة المراجعة بما يلي:',
            'أولاً: تفعيل التنبيهات الآلية للمراسلات التي تتجاوز مدة الانتظار 24 ساعة دون تهميش.',
            'ثانياً: تعميم ضوابط السرية وحماية البيانات الشخصية الواردة في المراسلات الخارجية على كافة الإدارات المعنية.',
            'ثالثاً: عقد جلسة مراجعة دورية كل شهر بين مدراء الإدارات لمعالجة أي صعوبات في التوجيه والإحالات المتبادلة.'
          ],
          signatureBlock: {
            title: 'مدير عام المراجعة الداخلية',
            name: 'د. يوسف بن محمود',
            date: '1448/02/27 هـ'
          }
        }
      ]
    }
  },
  {
    id: 'IEC-2026-004',
    refNumber: 'IEC-2026-004',
    subject: 'مذكرة تفاهم وتعاون مشترك في مجال تدريب وتطوير الكوادر البشرية',
    sender: 'المعهد العالي للإدارة والتنمية البشرية',
    senderRepresentative: 'د. إبراهيم بن علي النجار - العميد',
    dateGregorian: '09 أغسطس 2026',
    dateHijri: '26 صفر 1448 هـ',
    type: 'external',
    priority: 'urgent',
    status: 'pending',
    targetDepartment: 'الموارد البشرية والتدريب',
    summary: 'نرفق الصيغة النهائية لمشروع مسودة اتفاقية الشراكة التدريبية بعد استيفاء ملاحظات الإدارة القانونية بالطرفين للاعتماد النهائي والتوقيع.',
    pageCount: 2,
    annotations: {},
    routeHistory: [],
    completedAt: null,
    documentContent: {
      headerTitle: 'المعهد العالي للإدارة والتنمية البشرية',
      docTypeLabel: 'مشروع اتفاقية تعاون',
      refNo: 'MOU-2026-88',
      pages: [
        {
          pageNumber: 1,
          contentTitle: 'مسودة اتفاقية الشراكة والتدريب القيادي',
          bodyParagraphs: [
            'إنه في يوم الأحد الموافق 9 أغسطس 2026م، تم الاتفاق بين كل من:',
            'الطرف الأول: المؤسسة العامة للمراسلات والتأهيل الإداري.',
            'الطرف الثاني: المعهد العالي للإدارة والتنمية البشرية.',
            'تمهيد: نظراً لرغبة الطرفين في رفع كفاءة الكوادر الإدارية وتطوير المهارات القيادية في مجال إدارة المعاملات وتطبيق أحدث المعايير في التوجيه والتهميش الإلكتروني، اتفق الطرفان على البنود التالية:',
            'البند الأول: يقدم الطرف الثاني برامج تدريبية متخصصة شهرياً لمنسوبي الطرف الأول بواقع 12 دورة سنوياً.'
          ],
          signatureBlock: {
            title: 'عميد المعهد العالي',
            name: 'د. إبراهيم بن علي النجار',
            date: '2026/08/09م'
          }
        },
        {
          pageNumber: 2,
          contentTitle: 'الشروط المالية والتنفيذية والالتزامات',
          bodyParagraphs: [
            'البند الثاني: يحصل منسوبو الطرف الأول على خصم تفضيلي قدره 30% على كافة البرامج والشهادات الدبلوم التخصصية.',
            'البند الثالث: تلتزم المؤسسة بتوفير القاعات والوسائل التعليمية المناسبة لتنفيذ الدورات العملية داخل مقر المؤسسة.',
            'البند الرابع: تسري هذه الاتفاقية لمدة عام ميلادي كامل وتجدد تلقائياً بموافقة كتابية من الطرفين.',
            'حررت هذه المسودة من نسختين أصليتين بيد كل طرف نسخة للعمل بموجبها.'
          ],
          signatureBlock: {
            title: 'ممثل الطرف الأول',
            name: 'قيد الاعتماد والتوقيع',
            date: '1448/02/26 هـ'
          }
        }
      ]
    }
  },
  {
    id: 'IEC-2026-005',
    refNumber: 'IEC-2026-005',
    subject: 'طلب تزويد وتحديث التجهيزات والشبكات في قاعات الاجتماعات الرئيسية',
    sender: 'إدارة العلاقات العامة والإعلام',
    senderRepresentative: 'أ. سلطان بن حامد العلي - مدير العلاقات العامة',
    dateGregorian: '08 أغسطس 2026',
    dateHijri: '25 صفر 1448 هـ',
    type: 'internal',
    priority: 'normal',
    status: 'pending',
    targetDepartment: 'الشؤون المالية والحسابات',
    summary: 'نحيطكم علماً بالحاجة الماسة لاستبدال وتحديث أجهزة العرض الصوتية والمرئية في القاعة رقم (1) وقاعة الشرف لتأمين التغطية الإعلامية للمناسبات القادمة.',
    pageCount: 1,
    annotations: {},
    routeHistory: [],
    completedAt: null,
    documentContent: {
      headerTitle: 'جمهورية مصر العربية - إدارة العلاقات العامة والإعلام',
      docTypeLabel: 'طلب احتياج تقني وفني',
      refNo: 'PR-2026-105',
      pages: [
        {
          pageNumber: 1,
          contentTitle: 'طلب شاشة عرض تفاعلية وأنظمة صوت متطورة',
          bodyParagraphs: [
            'سعادة المدير العام المحترم،،',
            'السلام عليكم ورحمة الله وبركاته،، وبعد:',
            'نظراً لكثرة المؤتمرات الصحفية واجتماعات مجلس الإدارة المقامة في قاعة الاجتماعات الكبرى (1)، فقد لوحظ تقادم أجهزة العرض الحالية وتعطل وحدات الميكروفون المترجمة.',
            'نرفع لسعادتكم الطلب المرفق لشراء عدد (2) شاشة عرض تفاعلية 85 بوصة ونظام ميكروفونات لاسلكي متكامل لتغطية الاجتماعات الهامة.',
            'أملين التكرم بالموافقة والإحالة إلى الشؤون المالية والحسابات لإكمال إجراءات التثمين والطرح.'
          ],
          signatureBlock: {
            title: 'مدير العلاقات العامة',
            name: 'أ. سلطان بن حامد العلي',
            date: '1448/02/25 هـ'
          }
        }
      ]
    }
  },
  {
    id: 'IEC-2026-006',
    refNumber: 'IEC-2026-006',
    subject: 'استفسار حول العقد الإطاري للخدمات المساندة والصيانة العامة',
    sender: 'شركة الحلول المتكاملة للتشغيل والصيانة',
    senderRepresentative: 'م. طارق بن يوسف - مدير المشروع',
    dateGregorian: '05 أغسطس 2026',
    dateHijri: '22 صفر 1448 هـ',
    type: 'external',
    priority: 'important',
    status: 'pending',
    targetDepartment: 'الإدارة القانونية والحوكمة',
    summary: 'بالإشارة إلى العقد رقم 44/2025 المبرم بين الطرفين، نود توضيح النطاق الزمني للبند الخاص بالضمان النهائي والصيانة الدورية للأنظمة الكهربائية.',
    pageCount: 1,
    annotations: {},
    routeHistory: [],
    completedAt: null,
    documentContent: {
      headerTitle: 'شركة الحلول المتكاملة للتشغيل والصيانة',
      docTypeLabel: 'استفسار قانوني وارد',
      refNo: 'EXT-MAINT-2026-09',
      pages: [
        {
          pageNumber: 1,
          contentTitle: 'طلب تفسير البند 14 من العقد الإطاري',
          bodyParagraphs: [
            'إلى: سعادة المدير العام - المؤسسة العامة للمراسلات',
            'تحية طيبة وبعد،،',
            'بالإشارة إلى عقد الصيانة والخدمات المساندة رقم (44/2025)، يرجى التكرم بالمرئيات القانونية حول تمديد فترة الصيانة الوقائية لأجهزة التكييف المركزي والمولدات الاحتياطية.',
            'حيث تنص المادة 14 على إمكانية التمديد التلقائي لمد 6 أشهر بنفس الأسعار والشروط الشاملة للمواد وقطع الغيار الأصلية.',
            'نحيطكم علماً باستعدادنا التام لتجديد العقد فور توقيع ملحق المذكرة من طرفكم الكريم.'
          ],
          signatureBlock: {
            title: 'مدير مشروع الصيانة',
            name: 'م. طارق بن يوسف',
            date: '2026/08/05م'
          }
        }
      ]
    }
  }
];

const INITIAL_ARCHIVE_QUEUE = [
  {
    id: 'IEC-2026-000',
    refNumber: 'IEC-2026-000',
    subject: 'اعتماد لائحة تنظيم العمل الداخلي وحظر تنازع المصالح',
    sender: 'الإدارة القانونية والحوكمة',
    senderRepresentative: 'د. سامي بن أحمد - المستشار القانوني',
    dateGregorian: '01 أغسطس 2026',
    dateHijri: '18 صفر 1448 هـ',
    type: 'internal',
    priority: 'important',
    status: 'archived',
    targetDepartment: 'الموارد البشرية والتدريب',
    summary: 'تم مراجعة وتعديل اللائحة الداخلية للعمل بما يتوافق مع أحدث الأنظمة الحكومية والتشريعات الصادرة مؤخراً.',
    pageCount: 1,
    annotations: {},
    completedAt: '2026-08-02T10:15:00Z',
    routedTo: ['الموارد البشرية والتدريب', 'مكتب المدير العام'],
    signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    note: 'اعتمدت اللائحة المرفقة، يُعمل بها من تاريخه وتُنشر لكافة الإدارات للالتزام بها.',
    annotatorName: 'سعادة المدير العام',
    documentContent: {
      headerTitle: 'جمهورية مصر العربية - الإدارة القانونية والحوكمة',
      docTypeLabel: 'قرار إداري مكتمل ومؤرشف',
      refNo: 'IEC-2026-000/قانون',
      pages: [
        {
          pageNumber: 1,
          contentTitle: 'قرار رقم (14) لسنة 2026م بشأن لائحة العمل',
          bodyParagraphs: [
            'بعد الاطلاع على القانون العام والتوجيهات العليا، تقرر ما يلي:',
            'مادة (1): اعتماد لائحة السلوك الوظيفي وحظر تنازع المصالح للموظفين.',
            'مادة (2): تلتزم جميع القطاعات التابعة بإبلاغ كافة الموظفين بالتوقيع على نموذج الإقرار خلال 14 يوماً من تاريخه.',
            'مادة (3): يبلغ هذا القرار لمن يلزم لتنفيذه وإيداع نسخة بالارشيف.'
          ],
          signatureBlock: {
            title: 'المستشار القانوني',
            name: 'د. سامي بن أحمد',
            date: '1448/02/18 هـ'
          }
        }
      ]
    }
  }
];

// Helper to simulate API latency
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper for LocalStorage handling
function loadFromStorage(key, fallback) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return fallback;
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing ${key} to localStorage:`, err);
  }
}

// Service API layer
export const correspondenceService = {
  /**
   * Fetch pending queue with optional filtering
   * GET /api/resource/Internal External Correspondence?filters=...
   */
  async getPendingQueue(filters = {}) {
    await delay(200);
    let queue = loadFromStorage(STORAGE_KEY_PENDING, INITIAL_PENDING_QUEUE);

    if (filters.search) {
      const q = filters.search.trim().toLowerCase();
      queue = queue.filter(
        (item) =>
          item.refNumber.toLowerCase().includes(q) ||
          item.subject.toLowerCase().includes(q) ||
          item.sender.toLowerCase().includes(q) ||
          item.senderRepresentative.toLowerCase().includes(q)
      );
    }

    if (filters.status && filters.status !== 'all') {
      queue = queue.filter((item) => item.status === filters.status);
    }

    if (filters.type && filters.type !== 'all') {
      queue = queue.filter((item) => item.type === filters.type);
    }

    if (filters.priority && filters.priority !== 'all') {
      queue = queue.filter((item) => item.priority === filters.priority);
    }

    if (filters.department && filters.department !== 'all') {
      queue = queue.filter((item) => item.targetDepartment === filters.department);
    }

    return queue;
  },

  /**
   * Get single correspondence item by ID
   * GET /api/resource/Internal External Correspondence/{id}
   */
  async getCorrespondenceById(id) {
    await delay(150);
    const pending = loadFromStorage(STORAGE_KEY_PENDING, INITIAL_PENDING_QUEUE);
    const archive = loadFromStorage(STORAGE_KEY_ARCHIVE, INITIAL_ARCHIVE_QUEUE);

    const found = pending.find((item) => item.id === id) || archive.find((item) => item.id === id);
    if (!found) {
      throw new Error(`المراسلة رقم ${id} غير موجودة`);
    }
    return JSON.parse(JSON.stringify(found));
  },

  /**
   * Save canvas annotations for a correspondence
   * PUT/POST /api/method/moraslat.save_annotations
   */
  async saveAnnotations(id, annotationsPayload) {
    await delay(200);
    const pending = loadFromStorage(STORAGE_KEY_PENDING, INITIAL_PENDING_QUEUE);
    const index = pending.findIndex((item) => item.id === id);

    if (index !== -1) {
      pending[index].annotations = annotationsPayload;
      if (pending[index].status === 'pending') {
        pending[index].status = 'annotated';
      }
      saveToStorage(STORAGE_KEY_PENDING, pending);
      return pending[index];
    }
    return null;
  },

  /**
   * Finalize annotations, attach handwritten signature, route to departments, and move to Archive
   * POST /api/method/moraslat.finalize_and_route
   */
  async finalizeAndRoute(id, { signature, referTo = [], note = '' }) {
    await delay(400);
    const pending = loadFromStorage(STORAGE_KEY_PENDING, INITIAL_PENDING_QUEUE);
    const archive = loadFromStorage(STORAGE_KEY_ARCHIVE, INITIAL_ARCHIVE_QUEUE);

    const index = pending.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error('المراسلة غير موجودة في طابور المعالجة الحالي');
    }

    const itemToArchive = pending[index];
    itemToArchive.status = 'archived';
    itemToArchive.completedAt = new Date().toISOString();
    itemToArchive.routedTo = Array.isArray(referTo) ? referTo : [referTo];
    itemToArchive.signature = signature;
    itemToArchive.note = note;
    itemToArchive.annotatorName = 'سعادة المدير العام';

    // Remove from pending & add to archive
    pending.splice(index, 1);
    archive.unshift(itemToArchive);

    saveToStorage(STORAGE_KEY_PENDING, pending);
    saveToStorage(STORAGE_KEY_ARCHIVE, archive);

    return {
      success: true,
      archivedItem: itemToArchive,
      remainingCount: pending.length
    };
  },

  /**
   * Fetch archive queue
   * GET /api/resource/Internal External Correspondence?status=archived
   */
  async getArchive(filters = {}) {
    await delay(200);
    let archive = loadFromStorage(STORAGE_KEY_ARCHIVE, INITIAL_ARCHIVE_QUEUE);

    if (filters.search) {
      const q = filters.search.trim().toLowerCase();
      archive = archive.filter(
        (item) =>
          item.refNumber.toLowerCase().includes(q) ||
          item.subject.toLowerCase().includes(q) ||
          item.sender.toLowerCase().includes(q)
      );
    }

    if (filters.department && filters.department !== 'all') {
      archive = archive.filter((item) => item.routedTo && item.routedTo.includes(filters.department));
    }

    return archive;
  },

  /**
   * Save updated queue order (Drag & drop)
   */
  async saveQueueOrder(orderedQueue) {
    await delay(100);
    saveToStorage(STORAGE_KEY_PENDING, orderedQueue);
    return orderedQueue;
  },

  /**
   * Get department list
   */
  async getDepartmentsList() {
    return DEPARTMENTS;
  },

  /**
   * Reset data back to default mock dataset
   */
  async resetToMockData() {
    await delay(250);
    saveToStorage(STORAGE_KEY_PENDING, INITIAL_PENDING_QUEUE);
    saveToStorage(STORAGE_KEY_ARCHIVE, INITIAL_ARCHIVE_QUEUE);
    return { pending: INITIAL_PENDING_QUEUE, archive: INITIAL_ARCHIVE_QUEUE };
  }
};
