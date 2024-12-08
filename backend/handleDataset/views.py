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


from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .services.data_processing import load_dataframe, process_data

@csrf_exempt
def PurchaseDetailsApi(request):
    # Extract query parameters
    person_id = request.GET.get('personId', None)

    try:
        # Ensure person_id is provided
        if person_id is None:
            return JsonResponse({"error": "personId parameter is required"}, status=400)

        # Convert person_id to an integer
        person_id = int(person_id)

        # Load and process purchase and product data
        purchases_df = load_dataframe('purchases.csv')
        products_df = load_dataframe('products.csv')
        purchases_df = process_data(purchases_df)
        products_df = process_data(products_df)

        # Merge purchases with product details
        merged_data = purchases_df.merge(products_df, on='ProductName', how='left')
        user_data = merged_data[merged_data['PersonID'] == person_id]

        # Check if data is available for the user
        if user_data.empty:
            return JsonResponse({"error": "No data found for the given personId"}, status=404)

        # Add ImageURL column
        user_data['ImageURL'] = user_data['ProductName'].apply(
            lambda name: f"{name}.png"
        )

        # Prepare response data
        purchase_details = user_data.drop(columns=['PersonID']).to_dict(orient='records')

        # Return the data as JSON
        return JsonResponse({"personId": person_id, "purchaseDetails": purchase_details}, status=200)
    except Exception as e:
        # Handle errors and return a meaningful message
        return JsonResponse({"error": str(e)}, status=500)

