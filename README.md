# Threads — فروم/تردز با Next.js و Clerk

وب‌اپلیکیشن فروم/تردز (مشابه شبکه‌های اجتماعی کوتاه‌متن) با قابلیت ساخت ترد و ریپلای، مدیریت Community و آپلود مدیا. این پروژه با **Next.js (App Router)** ساخته شده و داده‌ها در **MongoDB** با **Mongoose** ذخیره می‌شوند.

## قابلیت‌های اصلی

- ساخت ترد (Thread) و ریپلای/کامنت با ساختار درختی
- مدیریت Community با استفاده از Organizationهای Clerk
- آپلود عکس/مدیا با UploadThing
- احراز هویت و مدیریت کاربر با Clerk

## تکنولوژی‌ها

### فرانت‌اند
- Next.js 14.2.5 (App Router)
- React 18
- Tailwind CSS + tailwindcss-animate
- Radix UI (Tabs، Label، Slot و ...)
- lucide-react (آیکن‌ها)
- react-hook-form + zod (فرم و اعتبارسنجی)
- @uploadthing/react (آپلود فایل)
- next/image، next/font

### بک‌اند و دیتابیس
- Node.js
- MongoDB + Mongoose 8.5.1

### احراز هویت
- Clerk (`@clerk/nextjs`, `@clerk/themes`)
- Middleware برای محافظت از مسیرها
- Svix برای اعتبارسنجی Webhookهای Clerk

### آپلود فایل
- UploadThing

## ساختار پروژه

```
app/
├─ globals.css
├─ (root)/
│  ├─ layout.tsx
│  └─ page.tsx
├─ (auth)/
│  └─ layout.tsx
└─ api/
   ├─ uploadthing/
   │  ├─ core.ts
   │  └─ route.ts
   └─ webhook/clerk/
      └─ route.ts

components/
├─ cards/          CommunityCard, ThreadCard, UserCard
├─ forms/          AccountProfile, Comment, PostThread
├─ shared/         Topbar, LeftSidebar, RightSidebar, Bottombar, Searchbar, ...
└─ ui/             button, form, input, label, tabs, textarea

lib/
├─ mongoose.ts               اتصال به MongoDB
├─ uploadthing.ts             هلپرهای آپلود
├─ actions/
│  ├─ thread.actions.ts       CRUD ترد و کامنت
│  ├─ community.actions.ts    مدیریت Community و اعضا
│  └─ user.actions.ts         پروفایل و لیست کاربران
├─ models/
│  ├─ thread.model.ts
│  ├─ user.model.ts
│  └─ community.model.ts
└─ validations/
   ├─ thread.ts
   └─ user.ts

middleware.ts
next.config.mjs
tailwind.config.ts
```

## نحوه کار (فلو کلی)

**۱. احراز هویت**
تمام مسیرها با `middleware.ts` تحت کنترل Clerk هستند. مسیرهای Public شامل `/`، `/api/uploadthing` و `/api/webhook/clerk`.

**۲. همگام‌سازی Community**
Clerk هنگام رویدادهای Organization به `/api/webhook/clerk` وبهوک می‌فرستد. صحت امضا با Svix بررسی و بر اساس نوع رویداد (`organization.created`، `organizationMembership.created/deleted`، `organization.updated/deleted`) دیتابیس به‌روزرسانی می‌شود.

**۳. ساخت ترد**
فرم `PostThread.tsx` متن ترد را می‌گیرد و از طریق اکشن `createThread` ذخیره می‌کند؛ در صورت انتخاب Community، شناسه آن نیز ذخیره می‌شود.

**۴. ساخت کامنت/ریپلای**
کامپوننت `Comment.tsx` با اکشن `addCommentToThread` ریپلای را با ساختار parentId/children ذخیره می‌کند.

## مدل‌های داده

**Thread**
`text`, `author` (ref User), `community` (ref Community، اختیاری), `parentId`, `children` (آرایه ref Thread), `createdAt`

**User**
`id`, `username` (unique), `name`, `image`, `bio`, `threads`, `onboarded`, `communities`

**Community**
`id`, `username` (unique), `name`, `image`, `bio`, `createdBy` (ref User), `threads`, `members`

## اکشن‌های اصلی بک‌اند

**thread.actions.ts**
- `fetchPosts(pageNumber, pageSize)` — دریافت تردهای ریشه با صفحه‌بندی
- `createThread({ text, author, communityId, path })`
- `deleteThread(id, path)` — حذف بازگشتی ترد و ریپلای‌های آن
- `addCommentToThread(threadId, commentText, userId, path)`
- `fetchThreadById(threadId)`

**community.actions.ts**
- `createCommunity`, `fetchCommunityDetails`, `fetchCommunityPosts`
- `fetchCommunities` (با جستجو و صفحه‌بندی)
- `addMemberToCommunity` / `removeUserFromCommunity`
- `updateCommunityInfo`, `deleteCommunity`

**user.actions.ts**
- `fetchUser`, `updateUser`, `fetchUserPosts`
- `fetchUsers` (با جستجو و صفحه‌بندی)
- `getActivity`

## اعتبارسنجی فرم‌ها (Zod)

- `ThreadValidation` — متن ترد حداقل ۳ کاراکتر
- `CommentValidation` — متن کامنت
- `UserValidation` — نام، یوزرنیم، بیوگرافی (تا ۱۰۰۰ کاراکتر)، آدرس تصویر پروفایل

## متغیرهای محیطی (.env.local)

```env
# MongoDB
MONGODB_URL=your_mongodb_connection_string

# Clerk Webhook
NEXT_CLERK_WEBHOOK_SECRET=your_webhook_secret
```

کلیدهای Clerk و تنظیمات UploadThing نیز طبق مستندات رسمی هرکدام باید در `.env.local` اضافه شوند.

## نصب و اجرا

### پیش‌نیازها
- Node.js
- MongoDB (لوکال یا Atlas)
- حساب Clerk (برای احراز هویت و Webhook)
- حساب UploadThing (برای آپلود فایل)

### مراحل

```bash
npm install
npm run dev
```

سپس در مرورگر به آدرس `http://localhost:3000` مراجعه کنید.

### Build و اجرای Production

```bash
npm run build
npm run start
```

## جمع‌بندی

پروژه‌ای کامل با فرانت‌اند Next.js/React، دیتابیس MongoDB، احراز هویت و مدیریت سازمان با Clerk، آپلود فایل با UploadThing، و ساختار داده‌ی درختی برای تردها و ریپلای‌ها.
