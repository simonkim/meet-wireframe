* Zone data
- Fields:
    - code: String
    - location: Object
        - center: Object
            - latitude: Number
            - longitude: Number
        - border: Object
            - latitude: Object
            - min: Number
            - max: Number
            - longitude: Object
            - min: Number
            - max: Number
    - name: String
    - radius (meters): Number
- Example
    {
        "code": "ZA4K",
        "location": {
            "center": {
                "latitude": "-8.5181352",
                "longitude": "115.26127620000001"
            },
            "border": {
                "latitude": {
                    "min": "-8.519034521605919",
                    "max": "-8.51723587839408"
                },
                "longitude": {
                    "min": "115.2603668473517",
                    "max": "115.26218555264832"
                }
            }
        }
    }
