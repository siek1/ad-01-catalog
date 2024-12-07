from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .services.data_processing import load_dataframe, process_data, get_recommendations_for_person

@csrf_exempt
def DataApi(request):
    # Extract query parameters
    person_id = request.GET.get('personId', None)
    top_n = request.GET.get('topN', 10)  # Default value for top_n

    try:
        # Ensure person_id is provided
        if person_id is None:
            return JsonResponse({"error": "personId parameter is required"}, status=400)

        # Convert top_n to an integer
        top_n = int(top_n)

        # Call the recommendation function
        recommendations = get_recommendations_for_person(person_id=int(person_id), top_n=top_n)

        # Prepare the response
        data = {
            "personId": person_id,
            "topRecommendations": recommendations
        }

        # Return the data as JSON
        return JsonResponse(data, status=200)
    except Exception as e:
        # Handle errors and return a meaningful message
        return JsonResponse({"error": str(e)}, status=500)
