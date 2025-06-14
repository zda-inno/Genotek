# Genotek Django Backend

Бэкенд-часть проекта Genotek, реализованная на Django REST Framework с использованием MongoDB в качестве основной базы данных.

## Структура проекта

```
backend_django/
├── genotek/                    # Основной пакет проекта
│   ├── api/                    # Приложение API
│   │   ├── models.py          # Модели MongoDB
│   │   ├── serializers.py     # Сериализаторы
│   │   ├── services.py        # Бизнес-логика
│   │   ├── views.py           # ViewSets и эндпоинты
│   │   └── apps.py            # Конфигурация приложения
│   ├── settings.py            # Настройки проекта
│   ├── urls.py                # Маршрутизация
│   └── wsgi.py               # WSGI конфигурация
├── requirements.txt           # Зависимости проекта
└── manage.py                 # Скрипт управления Django
```

## API Endpoints

### Основные эндпоинты

1. **Список всех семей**
   - URL: `/api/persons/families/`
   - Метод: `GET`
   - Ответ: Список ID семей и их общее количество

2. **Генеалогическое дерево**
   - URL: `/api/persons/family_tree/`
   - Метод: `GET`
   - Параметры: `family_id` (query parameter)
   - Ответ: Дерево семьи с полной информацией о всех членах

3. **Проверка аномалий**
   - URL: `/api/check_anomalies/`
   - Метод: `GET`
   - Параметры: `family_id` (query parameter)
   - Ответ: Результаты проверки аномалий в генеалогическом дереве

### CRUD операции с Person

1. **Создание человека**
   - URL: `/api/persons/`
   - Метод: `POST`
   - Тело запроса: JSON с данными человека

2. **Получение информации о человеке**
   - URL: `/api/persons/{person_id}/`
   - Метод: `GET`

3. **Обновление информации о человеке**
   - URL: `/api/persons/{person_id}/`
   - Метод: `PUT` или `PATCH`

4. **Удаление человека**
   - URL: `/api/persons/{person_id}/`
   - Метод: `DELETE`

### Документация API

- Swagger UI: `http://localhost:8000/swagger/`
- ReDoc: `http://localhost:8000/redoc/`

## Требования

- Python 3.12.2
- MongoDB 4.4+
- Django 4.2.10
- Django REST Framework
- mongoengine
- python-dotenv

## Установка и запуск

1. **Создание виртуального окружения**
   ```bash
   python -m venv venv
   source venv/bin/activate  # для Linux/Mac
   # или
   .\venv\Scripts\activate  # для Windows
   ```

2. **Установка зависимостей**
   ```bash
   pip install -r requirements.txt
   ```

3. **Настройка переменных окружения**
   Создайте файл `.env` в корневой директории проекта:
   ```
   MONGODB_URL=mongodb://localhost:27017
   MONGODB_DB_NAME=genotek
   ```

4. **Запуск сервера разработки**
   ```bash
   python manage.py runserver
   ```

## Структура данных

### Person Model
```python
{
    "person_id": str,          # Уникальный идентификатор
    "name": str,              # Имя
    "surname": str,           # Фамилия
    "middleName": str,        # Отчество
    "birthdate": {            # Дата рождения
        "day": int,
        "month": int,
        "year": int
    },
    "gender": str,            # Пол ("Male" или "Female")
    "birthplace": str,        # Место рождения
    "relatives": [            # Список родственников
        {
            "person_id": str,
            "relationType": str  # "parent", "child" или "spouse"
        }
    ],
    "family_id": str          # ID семьи
}
```

### BasicChecks Model
```python
{
    "family_id": str,         # ID семьи
    "checks": {               # Результаты проверок
        "missing_birthdate": {...},
        "invalid_date": {...},
        "isolated_person": {...},
        "non_reciprocal_relation": {...},
        "circular_relationship": {...}
    },
    "created_at": datetime    # Время создания проверки
}
```

## Проверки аномалий

API выполняет следующие проверки генеалогического дерева:

1. **Отсутствие даты рождения**
   - Проверяет наличие всех полей даты рождения
   - Возвращает список людей с отсутствующими данными

2. **Невалидные даты**
   - Проверяет корректность дат рождения
   - Проверяет, что дата не в будущем
   - Проверяет корректность дня для месяца

3. **Изолированные люди**
   - Находит людей без связей с другими членами семьи

4. **Невзаимные связи**
   - Проверяет, что все связи являются взаимными
   - Например, если A является родителем B, то B должен быть ребенком A

5. **Циклические связи**
   - Находит циклические зависимости в отношениях
   - Исключает допустимые циклы (например, супружеские пары)

## Разработка

### Добавление новых эндпоинтов

1. Добавьте новый метод в `PersonViewSet` в `views.py`
2. Обновите сериализаторы в `serializers.py` при необходимости
3. Добавьте бизнес-логику в `services.py`
4. Обновите документацию в Swagger UI

### Тестирование

Для тестирования API можно использовать:
- Swagger UI (`/swagger/`)
- ReDoc (`/redoc/`)
- curl или Postman
- Интеграционные тесты (в разработке) 