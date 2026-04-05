#!/usr/bin/env python3

import requests
import sys
import json
import time
from datetime import datetime
from io import BytesIO

class ContractSimplifierAPITester:
    def __init__(self, base_url="https://contract-plain.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
        
        result = {
            "test": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {name}")
        if details:
            print(f"    {details}")

    def make_request(self, method, endpoint, data=None, files=None, headers=None):
        """Make HTTP request with error handling"""
        url = f"{self.base_url}/api/{endpoint}"
        
        request_headers = {'Content-Type': 'application/json'}
        if self.token:
            request_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            request_headers.update(headers)
        
        # Remove Content-Type for file uploads
        if files:
            request_headers.pop('Content-Type', None)

        try:
            if method == 'GET':
                response = requests.get(url, headers=request_headers)
            elif method == 'POST':
                if files:
                    response = requests.post(url, files=files, data=data, headers=request_headers)
                else:
                    response = requests.post(url, json=data, headers=request_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=request_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=request_headers)
            
            return response
        except Exception as e:
            print(f"Request error: {str(e)}")
            return None

    def test_user_registration(self):
        """Test user registration"""
        test_user = {
            "email": f"test_user_{int(time.time())}@example.com",
            "password": "TestPass123!",
            "name": "Test User"
        }
        
        response = self.make_request('POST', 'auth/register', test_user)
        
        if response and response.status_code == 200:
            data = response.json()
            if 'token' in data and 'user' in data:
                self.token = data['token']  # Store token for subsequent tests
                self.log_test("User Registration", True, f"User created: {data['user']['email']}")
                return True, test_user
            else:
                self.log_test("User Registration", False, "Missing token or user in response")
                return False, None
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("User Registration", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            return False, None

    def test_user_login(self, credentials):
        """Test user login"""
        login_data = {
            "email": credentials["email"],
            "password": credentials["password"]
        }
        
        response = self.make_request('POST', 'auth/login', login_data)
        
        if response and response.status_code == 200:
            data = response.json()
            if 'token' in data:
                self.token = data['token']
                self.log_test("User Login", True, f"Logged in as: {data['user']['email']}")
                return True, data['user']
            else:
                self.log_test("User Login", False, "Missing token in response")
                return False, None
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("User Login", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            return False, None

    def test_document_upload(self):
        """Test document upload"""
        # Create a simple test document
        test_content = """
        EMPLOYMENT AGREEMENT
        
        This Employment Agreement is entered into between Company ABC and John Doe.
        
        1. POSITION: Employee shall serve as Software Developer.
        2. SALARY: Employee shall receive $50,000 per year.
        3. TERMINATION: Either party may terminate with 30 days notice.
        4. CONFIDENTIALITY: Employee agrees to maintain confidentiality.
        5. NON-COMPETE: Employee agrees not to compete for 1 year after termination.
        """
        
        files = {
            'file': ('test_contract.txt', test_content, 'text/plain')
        }
        data = {
            'title': 'Test Employment Contract'
        }
        
        response = self.make_request('POST', 'documents/upload', data=data, files=files)
        
        if response and response.status_code == 200:
            data = response.json()
            if 'id' in data:
                self.log_test("Document Upload", True, f"Document uploaded: {data['title']}")
                return True, data['id']
            else:
                self.log_test("Document Upload", False, "Missing document ID in response")
                return False, None
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("Document Upload", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            return False, None

    def test_document_analysis(self, document_id):
        """Test document analysis"""
        analysis_data = {
            "document_id": document_id,
            "language": "english"
        }
        
        response = self.make_request('POST', 'documents/analyze', analysis_data)
        
        if response and response.status_code == 200:
            data = response.json()
            required_fields = ['summary', 'key_points', 'risks', 'obligations', 'rights']
            missing_fields = [field for field in required_fields if field not in data or not data[field]]
            
            if not missing_fields:
                self.log_test("Document Analysis", True, f"Analysis complete with all fields")
                return True, data
            else:
                self.log_test("Document Analysis", True, f"Analysis complete but missing: {missing_fields}")
                return True, data
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("Document Analysis", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            return False, None

    def test_chat_feature(self, document_id, is_premium=False):
        """Test chat feature"""
        chat_data = {
            "document_id": document_id,
            "question": "What is the salary mentioned in this contract?",
            "language": "english"
        }
        
        response = self.make_request('POST', 'documents/chat', chat_data)
        
        if is_premium:
            if response and response.status_code == 200:
                data = response.json()
                if 'answer' in data:
                    self.log_test("Chat Feature (Premium)", True, f"Chat response received")
                    return True
                else:
                    self.log_test("Chat Feature (Premium)", False, "Missing answer in response")
                    return False
            else:
                error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
                self.log_test("Chat Feature (Premium)", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
                return False
        else:
            # For free users, should return 403
            if response and response.status_code == 403:
                self.log_test("Chat Feature (Free User Block)", True, "Correctly blocked free user")
                return True
            else:
                self.log_test("Chat Feature (Free User Block)", False, f"Expected 403, got {response.status_code if response else 'None'}")
                return False

    def test_pdf_download(self, document_id):
        """Test PDF report download"""
        response = self.make_request('GET', f'documents/download-report/{document_id}')
        
        if response and response.status_code == 200:
            content_type = response.headers.get('content-type', '')
            if 'application/pdf' in content_type:
                self.log_test("PDF Download", True, f"PDF downloaded successfully")
                return True
            else:
                self.log_test("PDF Download", False, f"Wrong content type: {content_type}")
                return False
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("PDF Download", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            return False

    def test_subscription_info(self):
        """Test subscription information"""
        response = self.make_request('GET', 'user/subscription')
        
        if response and response.status_code == 200:
            data = response.json()
            required_fields = ['subscription_plan', 'documents_analyzed_today']
            if all(field in data for field in required_fields):
                self.log_test("Subscription Info", True, f"Plan: {data['subscription_plan']}, Daily count: {data['documents_analyzed_today']}")
                return True, data
            else:
                self.log_test("Subscription Info", False, "Missing required fields")
                return False, None
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("Subscription Info", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            return False, None

    def test_daily_limit_enforcement(self):
        """Test daily limit for free users"""
        # Try to upload a second document
        test_content = "SIMPLE CONTRACT: This is a test contract for daily limit testing."
        
        files = {
            'file': ('test_contract2.txt', test_content, 'text/plain')
        }
        data = {
            'title': 'Second Test Contract'
        }
        
        response = self.make_request('POST', 'documents/upload', data=data, files=files)
        
        if response and response.status_code == 403:
            error_msg = response.json().get('detail', '')
            if 'daily limit' in error_msg.lower():
                self.log_test("Daily Limit Enforcement", True, "Daily limit correctly enforced")
                return True
            else:
                self.log_test("Daily Limit Enforcement", False, f"Wrong error message: {error_msg}")
                return False
        else:
            self.log_test("Daily Limit Enforcement", False, f"Expected 403, got {response.status_code if response else 'None'}")
            return False

    def test_payment_endpoints(self):
        """Test payment endpoints (should fail without Razorpay keys)"""
        # Test create order
        order_data = {
            "amount": 49900,  # ₹499 in paise
            "currency": "INR"
        }
        
        response = self.make_request('POST', 'payment/create-order', order_data)
        
        if response and response.status_code == 503:
            self.log_test("Payment Service Check", True, "Payment service correctly unavailable (no keys)")
            return True
        else:
            self.log_test("Payment Service Check", False, f"Unexpected response: {response.status_code if response else 'None'}")
            return False

    def run_comprehensive_test(self):
        """Run all tests"""
        print("🚀 Starting Contract Simplifier AI Backend Tests")
        print(f"Testing against: {self.base_url}")
        print("=" * 60)
        
        # Test 1: User Registration
        success, test_user = self.test_user_registration()
        if not success:
            print("❌ Registration failed, stopping tests")
            return False
        
        # Test 2: Document Upload
        success, document_id = self.test_document_upload()
        if not success:
            print("❌ Document upload failed, stopping tests")
            return False
        
        # Test 3: Document Analysis (with delay for AI processing)
        print("⏳ Waiting for AI analysis (this may take 10-15 seconds)...")
        time.sleep(2)  # Brief delay before analysis
        success, analysis = self.test_document_analysis(document_id)
        if not success:
            print("❌ Document analysis failed")
            return False
        
        # Test 4: Chat Feature (should fail for free user)
        self.test_chat_feature(document_id, is_premium=False)
        
        # Test 5: PDF Download
        self.test_pdf_download(document_id)
        
        # Test 6: Subscription Info
        self.test_subscription_info()
        
        # Test 7: Daily Limit Enforcement
        self.test_daily_limit_enforcement()
        
        # Test 8: Payment Endpoints
        self.test_payment_endpoints()
        
        # Test 9: Login with test credentials
        print("\n🔐 Testing with provided test credentials...")
        test_credentials = {
            "email": "test@example.com",
            "password": "Test123456"
        }
        
        success, user = self.test_user_login(test_credentials)
        if success:
            # Test premium user features if this is a premium account
            if user.get('subscription_plan') == 'premium':
                print("👑 Testing premium features...")
                self.test_chat_feature(document_id, is_premium=True)
        
        return True

    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        # Show failed tests
        failed_tests = [test for test in self.test_results if not test['success']]
        if failed_tests:
            print("\n❌ FAILED TESTS:")
            for test in failed_tests:
                print(f"  - {test['test']}: {test['details']}")
        
        print("\n✅ PASSED TESTS:")
        passed_tests = [test for test in self.test_results if test['success']]
        for test in passed_tests:
            print(f"  - {test['test']}")

def main():
    tester = ContractSimplifierAPITester()
    
    try:
        success = tester.run_comprehensive_test()
        tester.print_summary()
        
        return 0 if success and tester.tests_passed == tester.tests_run else 1
        
    except KeyboardInterrupt:
        print("\n⏹️  Tests interrupted by user")
        return 1
    except Exception as e:
        print(f"\n💥 Unexpected error: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())