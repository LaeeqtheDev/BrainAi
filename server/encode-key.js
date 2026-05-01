const fs = require('fs');

const serviceAccount = {
  "type": "service_account",
  "project_id": "mental-health-tracker-584ef",
  "private_key_id": "78a3a8b50d3d6bfbc58f8839bd8aaee428fc0e9a",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC/tXqXy49m6i6r\ncOOYJrIkeny8oq0LsHrnWdXVMoidOpsGV8Y69BEk2vsAWJilGfqmy1mKe3RTrTKl\nWiSVITsHxr4y0XnWLK1qpmGDF73n4Hq2dySvxQ7L0W5s85G1MFsgHGRGsR3sX34i\nmO5u7Wf2UH4A23ju4j4ZnbVHKrkx7QwlKBn8bUFTvg1lNSA+nsgQGd54SaW8Aj/U\nD5QVK6bwrhNFT9ZzBLdpgva+DrPcadq4M1qwnfwqCqBObsS/a3TIaRp75aXGWezI\nvGd4hReWdAzTIAxH8AskHuIYC0EPxH9yzVa5MHSron4gR+Vd/Wby3v89mGASUV45\n9KAzNmpdAgMBAAECggEALNmT9fXLVYglhXnaYSLya8rVKluDkPfHdR8FAgT5xZDr\nqkL4Lxwg86agcL8JbRzEEWgDCX0i5J2hOuJ5KwN0eDgEkMaFkrfulUQaDY2NIfWY\nN95tUIrRUJktVKNyG/nVY9CInCo9JircC1OMepqjhxJjPCecZgS7gwosmhryay2S\nKvqMJkwEYaZ8nhOOJLShSUOzKUe8CLlUYuEzxJUAqdVp3vUHImf+50IcupXB8XAJ\nbCPZ6yrj3Rkah+08lfJqbiXILHgucoqd2k32vCZ5BQOlzR79Gdu2ACchAWnpWp5X\nWYht+pI6fpNSSJ2xJvJxHY3mqs7N4qRpxSxu4G7iOQKBgQDx0/t1t/XOqsDknTYF\n3cJ2UNtnjknVYH1pUJUtjmnxI4K2/Fuws2yy9FHPkNQZMkgCFjdvt+3h25KR7u9I\nmsmQ4tfo7Nx1wncQdC4YigBRRDqcbR4YEtVVXdRdSckJT468w+D1wy9rvwte5FU6\n6LdACPXzaqog2ZxAr7eu+YifOQKBgQDK8ZXpvcumta5CFH6L2Y/G6iainCkO5FoJ\ntxDQzAb+ZdgLRz1i9tqevZj5Yd/PfGVP5kHLCda3xCUFSQg4ITFcG9QM+dgBFtTz\nJdhrtPC5qCfvfYH8V2LVmdvQ7hWOwNqPCbUstl5z2YvmYNo88xmLndXKgbJl6tUo\nd3R0SP+ARQKBgFOOHvBJo5DIxuU2vJfCS5J91ZEuRKyJLkvZH/IhptE+p8d54mRn\nWkNqz2mcbOxXxzGRY44iSvsi1r29hMfdU4/QETHVxUaa7nCs89BevkVWAbpSqXc/\n6p4YUWv6NpAVAQiP1YaU7imYVOFwm1JDXi2t6u00CZxYE/j1vc2jQmVhAoGBAKC/\nwVY3HwO67v+qih4uQ2N0/wtYlHEWUXdWiTxKD9QcSYeNc0Nbcwm/9la6vvPzfbBP\nG5g+/9PpysUn9xm2uQlThaCNmhoqwpyiQo318aOtXYympnqBoWi+CU6x92NuwPAB\n6X80KRasn9LorpUOnhJn//r6xptR6mu2Swj89VzdAoGBALPB2G6v/YTIHxedcYl7\nBKBw1DsYZkhDFHv1Vxbqf8nszEtHIYwxtEfHS0ajFCwIAGJUAOGNytI/8CGk2rIK\nZiqBdVvlrkgHN1AHatM1x7LHjl1L227n09PG15jon1VBPTl+NXFYxTz4lKM219Al\nyhlSm0UZ/B+jTKKElEwk8jYH\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@mental-health-tracker-584ef.iam.gserviceaccount.com",
  "client_id": "114555161799458977081",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40mental-health-tracker-584ef.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

const base64 = Buffer.from(JSON.stringify(serviceAccount)).toString('base64');
console.log('Base64 encoded credentials:');
console.log(base64);