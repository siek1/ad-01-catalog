from django.http import JsonResponse
from .services.data_processing import load_dataframe, process_data

def DataApi(request):
    # Extract query parameters
    person_id = request.GET.get('personId', None)

    # Load and process the data
    df = load_dataframe()
    df = process_data(df)

    # Filter by person_id if provided
    if person_id is not None:
        # Assuming your dataframe has a column "personId"
        df = df[df['personId'] == person_id]

    # Convert the DataFrame into a list of dictionaries
    data = df.to_dict(orient='records')

    # Return the data as JSON
    return JsonResponse(data, safe=False)
