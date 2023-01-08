import { Component, Renderer2, OnInit } from '@angular/core';
import { formatDate } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  formChecked = false;
  outputJSON = '';

  validationErrors: Array<{
    //массив ошибок валидации
    controlname: string;
    error: string;
    parentIndex: string;
  }> = [];

  fieldNames: {
    [componentName: string]: { printName: string; xmlName: string };
  } = {
    //словарь сопоставления ИД - название поля для вывода ошибок и json строки
    RegNomer: {
      printName: 'Регистрационный номер страхователя',
      xmlName: 'РегНомер',
    },
    NaimenovanieKratkoe: {
      printName: 'Наименование организации',
      xmlName: 'НаименованиеКраткое',
    },
    INN: { printName: 'ИНН', xmlName: 'ИНН' },
    KPP: { printName: 'КПП', xmlName: 'КПП' },
    Mesyats: { printName: 'Отчетный месяц', xmlName: 'Месяц' },
    KalendarnyjGod: { printName: 'Отчетный год', xmlName: 'КалендарныйГод' },
    TipFormy: { printName: 'Тип формы', xmlName: 'ТипФормы' },
    NomerPP: { printName: '№', xmlName: 'НомерПП' },
    FIO: { printName: 'ФИО', xmlName: 'ФИО' },
    Familiya: { printName: 'Фамилия', xmlName: 'Фамилия' },
    Imya: { printName: 'Имя', xmlName: 'Имя' },
    Otchestvo: { printName: 'Отчество', xmlName: 'Отчество' },
    SNILS: { printName: 'СНИЛС', xmlName: 'СНИЛС' },
    DataZapolneniya: { printName: 'Дата', xmlName: 'ДатаЗаполнения' },
    Strakhovatel: { printName: 'Страхователь', xmlName: 'Страхователь' },
    OtchetnyjPeriod: {
      printName: 'Отчетный период',
      xmlName: 'ОтчетныйПериод',
    },
    SpisokZL: {
      printName: 'Список застрахованных лиц',
      xmlName: 'СписокЗЛ',
    },
  };

  szvmform = this.fb.group(
    //объявление компонентов формы через формбилдер
    {
      TipFormy: ['', Validators.required],
      Strakhovatel: this.fb.group({
        RegNomer: [
          '',
          [Validators.required, Validators.pattern('^\\d{3}-\\d{3}-\\d{6}$')],
        ],
        NaimenovanieKratkoe: [
          '',
          [Validators.required, Validators.maxLength(255)],
        ],
        INN: [
          '',
          [Validators.required, Validators.pattern('^\\d{10}$|^\\d{12}$')],
        ],
        KPP: ['', [Validators.required, Validators.pattern('^\\d{9}$')]],
      }),
      OtchetnyjPeriod: this.fb.group({
        Mesyats: [
          '',
          [Validators.required, Validators.min(1), Validators.max(12)],
        ],
        KalendarnyjGod: [
          '',
          [
            Validators.required,
            Validators.min(2016),
            Validators.pattern('^\\d{4}$'),
          ],
        ],
      }),
      SpisokZL: this.fb.array([
        this.fb.group({
          NomerPP: [{ value: 1, disabled: true }, [Validators.required]],
          FIO: ['', [Validators.required]],
          SNILS: [
            '',
            [
              Validators.required,
              Validators.pattern('^\\d{3}-\\d{3}-\\d{3}( |-)\\d{2}$'),
            ],
          ],
          INN: ['', [Validators.pattern('^\\d{12}$')]],
        }),
      ]),
      DataZapolneniya: [
        '',
        [Validators.required, Validators.pattern('^\\d{2}.\\d{2}.\\d{4}$')],
      ],
    },
    { updateOn: 'submit' }
  );

  ngOnInit() {
    //начальные значения для тестов
    /* this.szvmform.controls.Strakhovatel.controls.NaimenovanieKratkoe.setValue(
      'ООО "Наименование организации"'
    );
    this.szvmform.controls.Strakhovatel.controls.RegNomer.setValue(
      '000-000-000000'
    );
    this.szvmform.controls.Strakhovatel.controls.INN.setValue('0000000000');
    this.szvmform.controls.Strakhovatel.controls.KPP.setValue('000000000');
    this.szvmform.controls.TipFormy.setValue('1');
    this.szvmform.controls.OtchetnyjPeriod.controls.KalendarnyjGod.setValue(
      '2023'
    );
    this.szvmform.controls.OtchetnyjPeriod.controls.Mesyats.setValue('1');
    this.szvmform.controls.SpisokZL.controls[0].controls.FIO.setValue(
      'Фамилия Имя Отчество'
    );
    this.szvmform.controls.SpisokZL.controls[0].controls.INN.setValue(
      '000000000000'
    );
    this.szvmform.controls.SpisokZL.controls[0].controls.SNILS.setValue(
      '000-000-000 00'
    );
    this.szvmform.controls.DataZapolneniya.setValue(
      formatDate(Date.now(), 'dd.MM.yyyy', 'en-US')
    ); */
  }

  splitFIO(fio: string): {
    //разделение ФИО на отдельные свойства объекта
    Familiya?: string;
    Imya?: string;
    Otchestvo?: string;
  } {
    let fioArray = fio.split(' ');
    let result: { [key: string]: string } = {};
    result['Familiya'] = fio;
    if (fioArray.length >= 2) {
      result['Familiya'] = fioArray[0];
      result['Imya'] = fioArray[1];
    }
    if (fioArray.length >= 3) result['Otchestvo'] = fioArray[2];
    if (fioArray.length > 3) {
      for (let i = 3; i < fioArray.length; i++)
        result['Otchestvo'] += ' ' + fioArray[i];
    }
    return result;
  }

  saveToJSON() {
    //сохранение в json строку
    this.outputJSON = JSON.stringify(
      this.szvmform.getRawValue(),
      (key, value) => {
        if (key === 'FIO') {
          return this.splitFIO((value as string).trim());
        }
        return value;
      },
      '   '
    ).replace(/\"[^\"]*\"\:/g, (m) => {
      let result = this.fieldNames[m.slice(1, -2)]?.xmlName;
      return result ? '"' + result + '":' : m;
    });
    console.log(this.outputJSON);
  }

  addRow() {
    //добавление строки таблицы
    this.szvmform.controls.SpisokZL.push(
      this.fb.group({
        NomerPP: [
          { value: this.szvmform.controls.SpisokZL.length + 1, disabled: true },
          Validators.required,
        ],
        FIO: ['', Validators.required],
        SNILS: [
          '',
          [
            Validators.required,
            Validators.pattern('^\\d{3}-\\d{3}-\\d{3}[ |-]\\d{2}$'),
          ],
        ],
        INN: ['', [Validators.pattern('^\\d{12}$')]],
      })
    );
    this.formChecked = false;
  }

  deleteRow(index: number) {
    //удаление строки таблицы
    if (this.szvmform.controls.SpisokZL.length > 1) {
      this.szvmform.controls.SpisokZL.removeAt(index);
      this.szvmform.controls.SpisokZL.controls.forEach((currentControl, i) => {
        currentControl.controls.NomerPP.setValue(i + 1);
      });
      this.formChecked = false;
    }
  }

  focusRegNomer(component: EventTarget | null) {
    let value = (component as HTMLInputElement).value.trim();
    if (value.match(/^\d{3}-\d{3}-\d{6}$/)) {
      (component as HTMLInputElement).value = value.replaceAll('-', '');
    }
  }

  blurRegNomer(component: EventTarget | null) {
    let value = (component as HTMLInputElement).value.trim();
    if (value.match(/^\d{12}$/)) {
      (component as HTMLInputElement).value =
        value.slice(0, 3) + '-' + value.slice(3, 6) + '-' + value.slice(-6);
    }
  }

  focusSNILS(component: EventTarget | null) {
    let value = (component as HTMLInputElement).value.trim();
    if (value.match(/^\d{3}-\d{3}-\d{3}[ |-]\d{2}$/)) {
      (component as HTMLInputElement).value = value
        .replaceAll('-', '')
        .replaceAll(' ', '');
    }
  }

  blurSNILS(component: EventTarget | null) {
    let value = (component as HTMLInputElement).value.trim();
    if (value.match(/^\d{11}$/)) {
      (component as HTMLInputElement).value =
        value.slice(0, 3) +
        '-' +
        value.slice(3, 6) +
        '-' +
        value.slice(6, 9) +
        ' ' +
        value.slice(-2);
    }
  }

  formValueChanged() {
    //обработка события изменения значения полей формы
    this.formChecked = false;
  }

  readValidationErrors(formGroup: FormGroup, parent?: string) {
    //рекурсивная функция перебора всех компонентов формы и сбора ошибок в массив
    Object.keys(formGroup.controls).forEach((name) => {
      let currentControl = formGroup.get(name);
      if (currentControl instanceof FormControl) {
        if (currentControl.errors) {
          if (currentControl.errors['required']) {
            this.validationErrors.push({
              controlname: name,
              error:
                'Поле "' +
                this.fieldNames[name].printName +
                '" обязательно для заполнения',
              parentIndex: parent ? parent : '',
            });
          }
          if (currentControl.errors['pattern']) {
            this.validationErrors.push({
              controlname: name,
              error:
                'Значение поля "' +
                this.fieldNames[name].printName +
                '" не соответствует шаблону',
              parentIndex: parent ? parent : '',
            });
          }
          if (currentControl.errors['maxLength']) {
            this.validationErrors.push({
              controlname: name,
              error:
                'Значение поля "' +
                this.fieldNames[name].printName +
                '" не должно быть длиннее ' +
                currentControl.errors['maxLength']['maxLength'] +
                ' символов',
              parentIndex: parent ? parent : '',
            });
          }
          if (currentControl.errors['min']) {
            this.validationErrors.push({
              controlname: name,
              error:
                'Значение поля "' +
                this.fieldNames[name].printName +
                '" не должно быть меньше ' +
                currentControl.errors['min']['min'],
              parentIndex: parent ? parent : '',
            });
          }
          if (currentControl.errors['max']) {
            this.validationErrors.push({
              controlname: name,
              error:
                'Значение поля "' +
                this.fieldNames[name].printName +
                '" не должно быть больше ' +
                currentControl.errors['max']['max'],
              parentIndex: parent ? parent : '',
            });
          }
        }
      } else if (currentControl instanceof FormGroup) {
        this.readValidationErrors(currentControl);
      } else if (currentControl instanceof FormArray) {
        currentControl.controls.forEach((arrayItem, i) => {
          if (arrayItem instanceof FormGroup) {
            this.readValidationErrors(arrayItem, i.toString());
          }
        });
      }
    });
  }

  validateForm() {
    this.szvmform.markAllAsTouched();
    this.validationErrors = [];
    this.readValidationErrors(this.szvmform);
    this.formChecked = true;
  }

  setFocus(controlName: string) {
    //переключение фокуса на компонент с ошибкой по нажатию ссылки
    this.renderer.selectRootElement('#' + controlName).focus();
  }

  constructor(private fb: FormBuilder, private renderer: Renderer2) {}
}
