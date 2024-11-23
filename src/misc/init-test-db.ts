// import { PrismaClient } from '@prisma/client'
import { db } from '../db'
import { ranks } from '../tutor'

// desktop db
// const db = new PrismaClient()

type LessonType = null | 'practical' | 'seminar' | 'lecture'

export async function createTestData() {
  const tutors = await createTutors()
  console.log('✅ tutors created')
  const [lebedeva, brodskaya, liubogoshev, nastaeva, osadchiy, kerme, savtiriova, sarkisyan, karatseva, saakova, savchenko] = tutors
  const subjects = await createSubjects()
  console.log('✅ subjects created')
  const [lebedeva_angl, brodskaya_kit, liubogoshev_kit, nastaeva_angl, osadchiy_phis, kerme_angl, savtiriova_kit, sarkisyan_ang, karatseva_angl, saakova_angl, savchenko_ling] = subjects
  const schedule = await createSchedule()
  const days = await createDays(schedule.id)

  //

  async function createTutors() {
    return db.tutor.createManyAndReturn({
      data: [
        {
          name: 'Марина',
          surname: 'Лебедева',
          middlename: 'Борисовна',
          rank: ranks[3],
        },
        {
          name: 'Мария',
          surname: 'Бродская',
          middlename: 'Сергеевна',
          rank: ranks[3],
        },
        {
          name: 'Николай',
          surname: 'Любогощев',
          middlename: 'Николаевич',
          rank: ranks[1],
        },
        {
          name: 'Людмила',
          surname: 'Настаева',
          middlename: 'Ханафиевна',
          rank: ranks[1],
        },
        {
          name: 'Александр',
          surname: 'Осадчий',
          middlename: 'Иванович',
          rank: ranks[3],
        },
        {
          name: 'Юлия',
          surname: 'Керме',
          middlename: 'Алексеевна',
          rank: ranks[3],
        },
        {
          name: 'Анна',
          surname: 'Савтырева',
          middlename: 'Александровна',
          rank: ranks[2],
        },
        {
          name: 'Мариана',
          surname: 'Саркисян',
          middlename: 'Робертовна',
          rank: ranks[3],
        },
        {
          name: 'Наира',
          surname: 'Карацева',
          middlename: 'Владимировна',
          rank: ranks[2],
        },
        {
          name: 'Анна',
          surname: 'Саакова',
          middlename: 'Сергеевна',
          rank: ranks[1],
        },
        {
          name: 'Татьяна',
          surname: 'Савченко',
          middlename: 'Дмитриевна',
          rank: ranks[3],
        },
      ],
    })
  }

  async function createSubjects() {
    return db.subject.createManyAndReturn({
      data: [
        {
          name: 'ПКРО 1 ИЯ',
          tutorId: lebedeva.id,
        },
        {
          name: 'Теория 2 ИЯ: Теор. грамматика',
          tutorId: brodskaya.id,
        },
        {
          name: 'ПКРО 2 ИЯ',
          tutorId: liubogoshev.id,
        },
        {
          name: 'ПКП 1 ИЯ',
          tutorId: nastaeva.id,
        },
        {
          name: 'Игровые виды спорта',
          tutorId: osadchiy.id,
        },
        {
          name: 'Практикум по последовательному переводу',
          tutorId: kerme.id,
        },
        {
          name: 'ПКП 2 ИЯ',
          tutorId: savtiriova.id,
        },
        {
          name: 'Теория 1 ИЯ: Стилистика',
          tutorId: sarkisyan.id,
        },
        {
          name: 'Спец. страноведение',
          tutorId: karatseva.id,
        },
        {
          name: 'Спец. перевод в сфере туризма и экскурсионного дела',
          tutorId: saakova.id,
        },
        {
          name: 'Общее языкознание',
          tutorId: savchenko.id,
        },
      ],
    })
  }

  async function createSchedule() {
    return db.schedule.create({
      data: {
        name: 'ПИП:СПСТЭД 511-21',
      },
    })
  }

  async function createDays(spstedScheduleId: number) {
    return db.$transaction(async (tx) => {
      const mon = await tx.day.create({
        data: {
          scheduleId: spstedScheduleId,
          lessons: {
            createMany: {
              data: [
                {
                  subjectId: lebedeva_angl.id,
                  place: '406 ИПРиМ',
                  type: 'practical' satisfies LessonType,
                },
                {
                  subjectId: lebedeva_angl.id,
                  place: '406 ИПРиМ',
                  type: 'practical' satisfies LessonType,
                },
                {
                  subjectId: brodskaya_kit.id,
                  place: '217 ИПРиМ',
                  type: 'seminar' satisfies LessonType,
                },
                {
                  subjectId: liubogoshev_kit.id,
                  place: '426 ИПРиМ',
                  type: 'practical' satisfies LessonType,
                },
              ],
            },
          },
        },
      })
      const tue = await tx.day.create({
        data: {
          scheduleId: spstedScheduleId,
          independentWorkDay: true,
        },
      })
      const wed = await tx.day.create({
        data: {
          scheduleId: spstedScheduleId,
          lessons: {
            createMany: {
              data: [
                {
                  subjectId: nastaeva_angl.id,
                  place: '418 ИПРиМ',
                  type: 'practical' satisfies LessonType,
                },
                {
                  subjectId: osadchiy_phis.id,
                  place: 'Спортзал ПГУ',
                  type: 'practical' satisfies LessonType,
                },
                {
                  subjectId: lebedeva_angl.id,
                  place: '406 ИПРиМ',
                  type: 'practical' satisfies LessonType,
                },
                {
                  subjectId: kerme_angl.id,
                  place: '303 ИПРиМ',
                  type: 'practical' satisfies LessonType,
                },
                {
                  subjectId: liubogoshev_kit.id,
                  place: '429 ИПРиМ',
                  type: 'practical' satisfies LessonType,
                },
              ],
            },
          },
        },
      })
      const thu = await tx.day.create({
        data: {
          scheduleId: spstedScheduleId,
          lessons: {
            createMany: {
              data: [
                {
                  subjectId: osadchiy_phis.id,
                  place: 'Зал настольного тенниса',
                  type: 'practical' satisfies LessonType,
                },
                {
                  subjectId: savtiriova_kit.id,
                  place: '309 ИПРиМ',
                  type: 'practical' satisfies LessonType,
                },
                {
                  subjectId: sarkisyan_ang.id,
                  place: '302 ИПРиМ',
                  type: 'seminar' satisfies LessonType,
                },
                {
                  subjectId: nastaeva_angl.id,
                  place: '307 ИПРиМ',
                  type: 'practical' satisfies LessonType,
                },
                {
                  subjectId: liubogoshev_kit.id,
                  place: '309 ИПРиМ',
                  type: 'practical' satisfies LessonType,
                },
              ],
            },
          },
        },
      })
      const fri = await tx.day.create({
        data: {
          scheduleId: spstedScheduleId,
          lessons: {
            createMany: {
              data: [
                {
                  subjectId: karatseva_angl.id,
                  place: '400 ИПРиМ',
                  type: 'seminar' satisfies LessonType,
                },
                {
                  subjectId: saakova_angl.id,
                  place: '421 ИПРиМ',
                  type: 'practical' satisfies LessonType,
                },
                {},
                {
                  subjectId: savchenko_ling.id,
                  place: '217 ИПРиМ',
                  type: 'lecture' satisfies LessonType,
                },
              ],
            },
          },
        },
      })
      const sat = await tx.day.create({
        data: {
          scheduleId: spstedScheduleId,
          lessons: {
            createMany: {
              data: [
                {},
                {
                  subjectId: lebedeva_angl.id,
                  place: '406 ИПРиМ',
                  type: 'practical' satisfies LessonType,
                },
              ],
            },
          },
        },
      })
      return [mon, tue, wed, thu, fri, sat]
    })
  }
}

async function run() {
  await createTestData()
  console.log('✅')
}

run()
